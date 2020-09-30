import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2';
import Point from '@mapbox/point-geometry';
import rhumbBearing from '@turf/rhumb-bearing';

export interface layerStyleParams {
  line?: {
    layout?: {
      [props: string]: any;
    };
    paint?: {
      [props: string]: any;
    };
  };
}

export interface positionTimeStampParams {
  currentTimestamp: number;
  prevTimestamp: number;
  nextTimestamp: number;
  step: number;
}

export interface directionParams {
  front: string;
  bottom: string;
}

export interface trackLayerOptions {
  layerId?: string;
  loaderType: string;
  url?: string;
  duration?: number; // // 两个点之间的动画时长 unit: s
  displayLine?: string; // TailLine/All
  layerStyle?: layerStyleParams;
  trackPoints?: GeoJSON.Feature[];
  position?: positionTimeStampParams;
  direction?: directionParams;
  unit?: string;
  scale?: number;
  fitBounds?: boolean;
  followCamera?: boolean;
}

interface modelTransformParams {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}

interface rotateInfoParams {
  originAxisIndex?: number;
  rotateAxisIndex: number;
  rotate: number;
}

export default class TrackLayerViewModel extends mapboxgl.Evented {
  layerId: string;
  lineLayerId: string;
  options: trackLayerOptions;
  trackPoints: GeoJSON.Feature[];
  lineData: [number, number][] = [];
  layerStyle: layerStyleParams = {};
  imageName: string = 'custom-image';
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  map: mapboxglTypes.Map;
  modelTransform: modelTransformParams;
  animateTime: number = 0;
  animateRemaining: number = 0;
  currentPosition: [number, number];
  startPosition: [number, number];
  destPosition: [number, number];
  rotateFactor: number = 0;
  animationFrameId: number;
  _animateLayerFn: () => void;
  position: positionTimeStampParams;
  originStartTimestamp: number;
  originNextTimestamp: number;
  animateStep: number;
  destTimestamp: number;
  startTimestamp: number;

  constructor(options: trackLayerOptions) {
    super();
    this.layerId = options.layerId || `tracklayer_${+new Date()}`;
    this.lineLayerId = `${this.layerId}-line`;
    this.layerStyle = options.layerStyle || {};
    this.trackPoints = options.trackPoints;
    this.position = options.position;
    this.options = {
      loaderType: options.loaderType,
      url: options.url,
      displayLine: options.displayLine,
      direction: options.direction,
      unit: options.unit,
      scale: options.scale,
      fitBounds: options.fitBounds,
      followCamera: options.followCamera
    };
    this._initPosition();
    this._animateLayerFn = this._animateLayer.bind(this);
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this._init(true);
  }

  setLoaderType(loaderType: string) {
    this.options.loaderType = loaderType;
    if (!loaderType) {
      this.removeSourceAndLayer();
      return;
    }
    if (!this.map) {
      return;
    }
    setTimeout(() => {
      this._init(true);
    }, 0);
  }

  setUrl(url: string) {
    this.options.url = url;
    if (!url) {
      this.removeSourceAndLayer();
      return;
    }
    if (!this.map || !this.options.loaderType) {
      return;
    }
    if (this.options.loaderType === 'IMAGE') {
      this.map.loadImage(url, (error, image) => {
        if (error) {
          console.error(error);
          return;
        }
        if (this.map.hasImage(this.imageName)) {
          this.map.removeImage(this.imageName);
          this.imageName = 'custom-image-' + new Date().getTime();
          this.map.addImage(this.imageName, image);
          this.map.setLayoutProperty(this.layerId, 'icon-image', this.imageName);
        } else {
          this._init();
        }
      });
    } else {
      this._init(true);
    }
  }

  setDisplayLine(displayLine: string) {
    this.options.displayLine = displayLine;
    const lineSource = this.map && this.map.getSource(this.lineLayerId);
    if (!lineSource) {
      return;
    }
    this._addTrackLineLayer();
  }

  setTrackPoints(trackPoints: GeoJSON.Feature[]) {
    this.trackPoints = trackPoints;
    if (!this.map) {
      return;
    }
    if (!trackPoints) {
      this.removeSourceAndLayer();
    }
    this.lineData = [];
    this._init(true);
  }

  setPosition(timestampInfo: positionTimeStampParams) {
    if (!this.trackPoints) {
      return;
    }
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
    this.originStartTimestamp = this.position && this.position.prevTimestamp;
    this.originNextTimestamp = this.position && this.position.nextTimestamp;
    this.position = timestampInfo;
    let destCoordinates, matchNextPosition, matchStartPosition, animateStep;
    const matchNextPositionIndex = this.trackPoints.findIndex(
      (item: GeoJSON.Feature) => item.properties.timestamp > timestampInfo.currentTimestamp
    );
    if (matchNextPositionIndex > -1) {
      matchNextPosition = this.trackPoints[matchNextPositionIndex];
      matchStartPosition = this.trackPoints[matchNextPositionIndex - 1];
      // @ts-ignore
      destCoordinates = matchNextPosition.geometry.coordinates;
      this.destPosition = destCoordinates;
      this.destTimestamp = matchNextPosition.properties.timestamp;
      this.startTimestamp = matchStartPosition.properties.timestamp;
    }
    if (this.originStartTimestamp !== timestampInfo.prevTimestamp) {
      this.animateRemaining = 0;
      const matchCurrentPosition = this.trackPoints.find(
        (item: GeoJSON.Feature) => item.properties.timestamp === timestampInfo.currentTimestamp
      );
      if (matchCurrentPosition) {
        // @ts-ignore
        this.startPosition = matchCurrentPosition.geometry.coordinates;
      } else if (destCoordinates) {
        const totalTime = matchNextPosition.properties.timestamp - this.startTimestamp;
        const diff = timestampInfo.currentTimestamp - this.startTimestamp;
        const percent = diff / totalTime;
        // @ts-ignore
        this.startPosition = this._getWayPoint(percent, matchStartPosition.geometry.coordinates, destCoordinates);
      }
      this.lineData = this.trackPoints
        .slice(0, matchNextPositionIndex)
        // @ts-ignore
        .map(item => item.geometry.coordinates);
      this._setRotateFactor();
      this._initLayer(this.startPosition);
    } else if (!timestampInfo.nextTimestamp && this.animateRemaining > 0) {
      animateStep = this.animateRemaining;
    }
    if (timestampInfo.nextTimestamp && destCoordinates) {
      if (timestampInfo.currentTimestamp === timestampInfo.prevTimestamp) {
        const stepBetweenNearPoints = timestampInfo.nextTimestamp - timestampInfo.currentTimestamp;
        const totalTime = this.destTimestamp - timestampInfo.currentTimestamp;
        const intervals = totalTime / stepBetweenNearPoints;
        animateStep = animateStep || intervals * timestampInfo.step;
      } else {
        animateStep = animateStep || this.destTimestamp - this.startTimestamp;
      }
      this.animateStep = animateStep;
      this.animateTime = performance.now() + animateStep;
      this._setRotateFactor();
      this._animateLayer();
    } else if (this.destPosition && this.originNextTimestamp) {
      this.destPosition = null;
    }
  }

  setLayerStyle(layerStyle: layerStyleParams) {
    this.layerStyle = layerStyle;
    if (!layerStyle || !this.map.getSource(this.lineLayerId)) {
      return;
    }
    let { paint, layout } = layerStyle.line;
    if (paint) {
      for (let prop of Object.keys(paint)) {
        this.map.setPaintProperty(this.lineLayerId, prop, paint[prop]);
      }
    }
    if (layout) {
      for (let prop of Object.keys(layout)) {
        this.map.setLayoutProperty(this.lineLayerId, prop, layout[prop]);
      }
    }
  }

  setDirection(direction: directionParams) {
    this.options.direction = direction;
    this._init();
  }

  setUnit(unit: string) {
    this.options.unit = unit;
    this._init(true);
  }

  setScale(scale: number) {
    this.options.scale = isNaN(+scale) ? 0 : +scale;
    this._init(true);
  }

  setFitBounds(fitBounds: boolean) {
    this.options.fitBounds = fitBounds;
    this._init(true);
  }

  setFollowCamera(followCamera: boolean) {
    this.options.followCamera = followCamera;
  }

  private _initPosition() {
    if (this.position && this.trackPoints) {
      const matchStartPositionIndex = this.trackPoints.findIndex(
        (item: GeoJSON.Feature) => item.properties.timestamp >= this.position.currentTimestamp
      );
      const matchStartPosition = matchStartPositionIndex > -1 ? this.trackPoints[matchStartPositionIndex] : this.trackPoints[0];
      if (matchStartPosition) {
        // @ts-ignore
        this.startPosition = matchStartPosition.geometry.coordinates;
        let nextPosition;
        if (this.position.nextTimestamp) {
          const matchNextPosition = this.trackPoints.find(
            (item: GeoJSON.Feature) => item.properties.timestamp > this.position.nextTimestamp
          );
          // @ts-ignore
          matchNextPosition && (nextPosition = matchNextPosition.geometry.coordinates);
        }
        if (!nextPosition && this.trackPoints[matchStartPositionIndex + 1]) {
          // @ts-ignore
          this.destPosition = this.trackPoints[matchStartPositionIndex + 1].geometry.coordinates;
        }
      }
    }
  }

  private _setRotateFactor() {
    // 若设置 bearing 不需要动画的话，则在此设置
    // if (this.options.followCamera) {
    //   const currentBearing = rhumbBearing(this.startPosition, this.destPosition);
    //   this.map.setBearing(currentBearing);
    // }
    const pointInfo = this._getPointInfo();
    this.rotateFactor = 0;
    if (pointInfo) {
      const startPoint = pointInfo.startPoint;
      const endPoint = pointInfo.endPoint;
      let rad = Math.atan((endPoint.y - startPoint.y) / (endPoint.x - startPoint.x));
      if (endPoint.x - startPoint.x < 0) {
        rad = Math.PI + rad;
      }

      this.rotateFactor = isNaN(rad) ? 0 : -rad;
    }
    if (this.map) {
      const bearing = (this.map.getBearing() * Math.PI) / 180;
      this.rotateFactor -= bearing;
    }
  }

  private _init(removedLayer?: boolean) {
    if (removedLayer) {
      this.removeSourceAndLayer();
      this._initPosition();
    }
    this._setRotateFactor();
    this._initLayer();
  }

  private _getWayPoint(percent: number, startPosition?: [number, number], destPosition?: [number, number]): any {
    const pointInfo = this._getPointInfo(startPosition, destPosition);
    if (pointInfo) {
      const startPoint = pointInfo.startPoint;
      const endPoint = pointInfo.endPoint;
      const nextPoint = endPoint
        .sub(startPoint)
        .mult(percent)
        .add(startPoint);
      const nextPosition = this.map.unproject(nextPoint).toArray();
      return nextPosition;
    }
  }

  private _animateLayer() {
    let remaining, gone, percent;
    if (this.position.currentTimestamp === this.position.prevTimestamp) {
      const now = performance.now();
      remaining = this.animateTime - now;
      gone = this.animateStep - remaining;
      percent = gone / this.animateStep;
    } else {
      remaining = this.destTimestamp - this.position.currentTimestamp;
      gone = this.position.currentTimestamp - this.position.prevTimestamp;
      percent = gone / this.animateStep;
    }
    if (remaining > 0) {
      this.animateRemaining = remaining;
      const nextPosition = this._getWayPoint(percent);
      if (nextPosition) {
        this.lineData.push(nextPosition);
        this._initLayer(nextPosition);
      }
      this.animationFrameId = requestAnimationFrame(this._animateLayerFn);
    } else {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private _initLayer(positionCoordinate: [number, number] = this.currentPosition) {
    const position = positionCoordinate || this.startPosition;
    if (!position || !this.map || !this.options.url || !this.options.loaderType) {
      return;
    }
    if (this.options.followCamera) {
      let options = {
        center: position,
        pitch: 60
      };
      if (this.startPosition && this.destPosition) {
        // @ts-ignore
        options.bearing = rhumbBearing(this.startPosition, this.destPosition);
      }
      this.map.easeTo(options);
    }
    switch (this.options.loaderType) {
      case 'GLTF':
      case 'OBJ2':
        this._addCustomLayer(position);
        break;
      case 'IMAGE':
        this._addImageLayer(position);
    }
    this._addTrackLineLayer();
  }

  private _addCustomLayer(positionCoordinate: [number, number]) {
    this.currentPosition = positionCoordinate;
    this.modelTransform = this._getModelTransform(positionCoordinate);
    if (!this.map.getLayer(this.layerId)) {
      const customLayer = {
        id: this.layerId,
        type: 'custom',
        renderingMode: '3d',
        onAdd: (map, gl) => {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          const directionalLight = new THREE.DirectionalLight(0xffffff);
          directionalLight.position.set(0, -70, 100).normalize();
          this.scene.add(directionalLight);

          const directionalLight2 = new THREE.DirectionalLight(0xfffffff);
          directionalLight2.position.set(0, 70, 100).normalize();
          this.scene.add(directionalLight2);

          this._dealWithLoader();
          this.map = map;
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
          });
          this.renderer.autoClear = false;
        },
        render: (gl, matrix) => {
          const modelTransform = this.modelTransform;
          const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
          const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
          const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

          const m = new THREE.Matrix4().fromArray(matrix);
          const l = new THREE.Matrix4()
            .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
            .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

          this.camera.projectionMatrix = m.multiply(l);
          this.renderer.state.reset();
          this.renderer.render(this.scene, this.camera);
          // @ts-ignore
          this.map.triggerRepaint();
        }
      };
      // @ts-ignore
      this.map.addLayer(customLayer);
    }
  }

  private _addImageLayer(positionCoordinate: [number, number]) {
    const url = this.options.url;
    const imageSource = this.map.getSource(this.layerId);
    const sourceData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: positionCoordinate
          },
          properties: {}
        }
      ]
    };
    if (imageSource) {
      // @ts-ignore
      imageSource.setData(sourceData);
    } else {
      if (!this.map.hasImage(this.imageName)) {
        this.map.loadImage(url, (error, image) => {
          if (error) {
            console.error(error);
            return;
          }
          this.map.addImage(this.imageName, image);
          this.map.addSource(this.layerId, {
            type: 'geojson',
            data: sourceData
          });
          this.map.addLayer({
            type: 'symbol',
            id: this.layerId,
            source: this.layerId,
            layout: {
              'icon-image': this.imageName,
              'icon-size': this.options.scale || 1,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });
        });
      } else {
        this.map.addSource(this.layerId, {
          type: 'geojson',
          data: sourceData
        });
        this.map.addLayer({
          type: 'symbol',
          id: this.layerId,
          source: this.layerId,
          layout: {
            'icon-image': this.imageName,
            'icon-size': this.options.scale || 1
          }
        });
      }
    }
  }

  private _addTrackLineLayer() {
    const imageSource = this.map.getSource(this.lineLayerId);
    let features;
    if (!this.options.displayLine) {
      features = [];
    } else {
      let coordinates = this.lineData;
      if (this.options.displayLine === 'All') {
        // @ts-ignore
        coordinates = this.trackPoints.map(item => item.geometry.coordinates);
      }
      features = [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates
          },
          properties: {}
        }
      ];
    }
    const sourceData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features
    };
    if (imageSource) {
      // @ts-ignore
      imageSource.setData(sourceData);
    } else {
      const lineStyle = (this.layerStyle && this.layerStyle.line) || {};
      this.map.addSource(this.lineLayerId, {
        type: 'geojson',
        data: sourceData
      });

      this.map.addLayer(
        {
          type: 'line',
          id: this.lineLayerId,
          source: this.lineLayerId,
          layout: lineStyle.layout || {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: lineStyle.paint || {
            'line-color': '#065726',
            'line-width': 5,
            'line-opacity': 0.8
          }
        },
        this.map.getLayer(this.layerId) ? this.layerId : null
      );
    }
  }

  private _getFontRotate(front: string): rotateInfoParams {
    // 不管 front 的朝向如何，最终的朝向是 x 轴的正方向
    let rotateInfo: rotateInfoParams = {
      rotateAxisIndex: void 0,
      rotate: void 0
    };
    switch (front) {
      case '-x':
        rotateInfo.rotateAxisIndex = 2;
        rotateInfo.rotate = 180;
        break;
      case 'y':
        rotateInfo.rotateAxisIndex = 2;
        rotateInfo.rotate = -90;
        break;
      case '-y':
        rotateInfo.rotateAxisIndex = 2;
        rotateInfo.rotate = 90;
        break;
      case 'z':
        rotateInfo.rotateAxisIndex = 1;
        rotateInfo.rotate = 90;
        break;
      case '-z':
        rotateInfo.rotateAxisIndex = 1;
        rotateInfo.rotate = -90;
        break;
    }
    return rotateInfo;
  }

  private _getBottomRotate(bottom: string): rotateInfoParams {
    // 不管 bottom 的朝向如何，最终的朝向是 z 轴的负方向
    let rotateInfo: rotateInfoParams = {
      originAxisIndex: void 0,
      rotateAxisIndex: void 0,
      rotate: void 0
    };
    switch (bottom) {
      case 'x':
        rotateInfo.originAxisIndex = 0;
        rotateInfo.rotateAxisIndex = 1;
        rotateInfo.rotate = 90;
        break;
      case '-x':
        rotateInfo.originAxisIndex = 0;
        rotateInfo.rotateAxisIndex = 1;
        rotateInfo.rotate = -90;
        break;
      case 'y':
        rotateInfo.originAxisIndex = 1;
        rotateInfo.rotateAxisIndex = 0;
        rotateInfo.rotate = -90;
        break;
      case '-y':
        rotateInfo.originAxisIndex = 1;
        rotateInfo.rotateAxisIndex = 0;
        rotateInfo.rotate = 90;
        break;
      case 'z':
        rotateInfo.originAxisIndex = 2;
        rotateInfo.rotateAxisIndex = 1;
        rotateInfo.rotate = 180;
        break;
    }
    return rotateInfo;
  }

  private _getModelTransform(positionCoordinate: [number, number]): modelTransformParams {
    const modelOrigin = positionCoordinate;
    const modelAltitude = 0;
    const modelRotate = [0, 0, 0];
    const { front, bottom } = this.options.direction || { front: null, bottom: null };
    let bottomAxisIndex = 2;
    if (front) {
      const rotateInfo = this._getFontRotate(front);
      if (rotateInfo.rotateAxisIndex !== void 0) {
        modelRotate[rotateInfo.rotateAxisIndex] += (rotateInfo.rotate * Math.PI) / 180;
      }
    }
    if (bottom) {
      const rotateInfo = this._getBottomRotate(bottom);
      if (rotateInfo.rotateAxisIndex !== void 0) {
        modelRotate[rotateInfo.rotateAxisIndex] += (rotateInfo.rotate * Math.PI) / 180;
        bottomAxisIndex = rotateInfo.originAxisIndex;
      }
    }
    modelRotate[bottomAxisIndex] += this.rotateFactor;
    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };
    return modelTransform;
  }

  private _getUnitFactor(): number {
    switch (this.options.unit) {
      case 'millimeter':
        return 1000;
      case 'centimeter':
        return 100;
      default:
        return 1;
    }
  }
  private _getMeterFactor(): number {
    const modelScale = this.options.scale;
    let scaleFactor: number;
    if (this.options.fitBounds) {
      scaleFactor = 1;
    } else {
      scaleFactor = modelScale || 1;
    }
    const unitFactor = this._getUnitFactor();
    const result = scaleFactor / unitFactor;
    return result;
  }

  private _getFitBoundsFactor(scene: any, scaleFactor: number): number {
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    // @ts-ignore
    const extent = this.map.getCRS().extent;
    const resolution = Math.max(extent[2] - extent[0], extent[3] - extent[2]) / 512 / Math.pow(2, this.map.getZoom());
    const canvasWidthDistance = resolution * this.map.getCanvas().width;
    const unitFactor = this._getUnitFactor();
    const result = ((scaleFactor * canvasWidthDistance) / (maxSize / unitFactor)) * 0.5;
    return result;
  }

  private _setMapZoom(scene: any, scaleFactor: number): void {
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = bbox.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    // @ts-ignore
    const extent = this.map.getCRS().extent;
    const maxExtent = Math.max(extent[2] - extent[0], extent[3] - extent[2]) / 512;
    const unitFactor = this._getUnitFactor();
    const resolution = (maxSize / unitFactor) * scaleFactor * 8 / this.map.getCanvas().width;
    const zoom = Math.log2(maxExtent / resolution) ;
    this.map.setZoom(zoom);
    this.map.setCenter(this.currentPosition);
  }

  private _getScaleFactor(scene: any): number {
    const meterFactor = this._getMeterFactor();
    if (this.options.fitBounds) {
      return this._getFitBoundsFactor(scene, meterFactor);
    }
    this._setMapZoom(scene, this.options.scale);
    return meterFactor;
  }

  private _dealWithLoader() {
    let loader;
    switch (this.options.loaderType) {
      case 'GLTF':
        loader = new GLTFLoader();
        loader.load(
          this.options.url,
          gltf => {
            const scaleFactor = this._getScaleFactor(gltf.scene);
            gltf.scene.scale.multiplyScalar(scaleFactor);
            this.scene.add(gltf.scene);
          },
          xhr => {
            // called while loading is progressing
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          error => {
            // called when loading has errors
            console.error('An error happened', error);
          }
        );
        break;
      case 'OBJ2':
        loader = new OBJLoader2();
        var material = new THREE.MeshBasicMaterial({
          color: 'red',
          wireframe: true
        });

        loader.load(
          this.options.url,
          object3d => {
            const scaleFactor = this._getScaleFactor(object3d);
            object3d.scale.multiplyScalar(scaleFactor);

            loader.addMaterials({ tester: material }, true);
            this.scene.add(object3d);
          },
          xhr => {
            // called while loading is progressing
            console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
          },
          null,
          error => {
            // called when loading has errors
            console.error('An error happened', error);
          }
        );
        break;
    }
  }

  private _getPointInfo(startPosition: any = this.startPosition, destPosition: any = this.destPosition): any {
    if (!startPosition || !destPosition || !this.map) {
      return;
    }
    const startPixelPoint = this.map.project(startPosition);
    const endPixelPoint = this.map.project(destPosition);
    const startPoint = new Point(startPixelPoint.x, startPixelPoint.y);
    const endPoint = new Point(endPixelPoint.x, endPixelPoint.y);
    return {
      startPoint,
      endPoint
    };
  }

  removeSourceAndLayer() {
    const { map, layerId, lineLayerId } = this;
    if (map) {
      if (layerId) {
        map.getLayer(layerId) && map.removeLayer(layerId);
        map.getSource(layerId) && map.removeSource(layerId);
      }
      if (lineLayerId) {
        map.getLayer(lineLayerId) && map.removeLayer(lineLayerId);
        map.getSource(lineLayerId) && map.removeSource(lineLayerId);
        this.lineData = [];
      }
    }
  }

  removed() {
    this.removeSourceAndLayer();
    this.map = null;
  }

  reset() {
    this.lineData = [];
  }
}
