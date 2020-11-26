import * as THREE from 'three';
import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import Tendrils from './assets/tendrils.png';
import { FeatureCollection } from 'geojson';
/**
 * @class FireLayerViewModel
 * @param {mapboxgl.map} map - mapboxgl map 对象。
 */

interface modelTransform {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
}
export default class FireLayerViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  layerId: string;

  features: FeatureCollection;

  modelScale: number;

  camera: THREE.PerspectiveCamera;

  scene: THREE.Scene;

  renderer: THREE.WebGLRenderer;

  private _object: THREE.Group;

  private _fireballs: any;

  private _height: number;

  private _radius: number;

  private _fireMaterial: THREE.ShaderMaterial;

  private _light: THREE.PointLight;

  private _lightIntensity: number;

  constructor(
    features: FeatureCollection,
    modelScale: number = 5.41843220338983e-6,
    layerId?: string
  ) {
    super();
    this.layerId = layerId;
    this.features = features;
    this.modelScale = modelScale;
  }

  public setMap(mapInfo) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this._addFireLayer();
  }

  public setFeatures(features: any): void {
    this.features = features;
    this._addFireLayer();
  }

  public setModelScale(modelScale: number): void {
    this.modelScale = modelScale;
    this._addFireLayer();
  }

  private _addFireLayer(): void {
    if (!this.map || !this.features || !this.features.features) {
      return;
    }
    let feature = this.features.features[0];
    if (feature.geometry.type !== 'Point') {
      throw new Error("Feature's type must be point");
    }
    if (this.features.features.length > 50) {
      throw new Error('The maximum number of features is 50');
    }
    this.features.features.forEach((feature, index) => {
      let geometry = feature.geometry;
      if (geometry.type === 'Point') {
        this._initializeFireLayer(geometry.coordinates, index);
      }
    });
  }

  private _initializeFireLayer(originCoordinate, index): void {
    let modelTransform = this._getModelTransform(originCoordinate);
    let layerId = (this.layerId && this.layerId + '-' + index) || `threeLayerFire-${new Date()}`;
    this.map.getLayer(layerId) && this.map.removeLayer(layerId);
    let customLayer = {
      id: layerId,
      type: 'custom',
      renderingMode: '3d',
      onAdd: (map, gl) => {
        this.camera = new THREE.PerspectiveCamera(45, map.getCanvas().width / map.getCanvas().height, 0.1, 2000);
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });
        this.renderer.autoClear = false;

        let rig = new THREE.Group();
        rig.add(this.camera);
        this.scene.add(rig);
        this._fire();
        this.scene.add(this._object);
        let light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 20);

        this.scene.add(light);
        this.map = map;
      },
      render: (gl, matrix) => {
        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4()
          .makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
          .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
          .multiply(rotationX)
          .multiply(rotationY)
          .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this._update();
        this.renderer.render(this.scene, this.camera);
        // @ts-ignore
        this.map.triggerRepaint();
      }
    };
    // @ts-ignore  TODO mapbox-gl types 未更新
    this.map.addLayer(customLayer);
  }

  private _getModelTransform(originCoordinate: [number, number]): modelTransform {
    let modelOrigin = originCoordinate;
    let modelAltitude = 0;
    let modelRotate = [Math.PI / 2, 0, 0];
    let modelTransform = {
      translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).x,
      translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).y,
      translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).z,
      rotateX: modelRotate[0],
      rotateY: modelRotate[1],
      rotateZ: modelRotate[2],
      scale: this.modelScale
    };
    return modelTransform;
  }

  private _fire(density: number = 150, height: number = 8, r: number = 0.2): void {
    this._object = new THREE.Group();

    this._fireballs = [];

    this._height = height;
    this._radius = r;

    var texture = new THREE.TextureLoader().load(
      Tendrils,
      function() {
        console.log('loaded');
      },
      undefined,
      function(e) {
        console.log('error', e);
      }
    );
    // @ts-ignore
    texture.crossOrigin = ''; // "anonymous";

    this._fireMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        blend: { value: 1.0 },
        blendPattern: { type: 't', value: texture }
      },
      vertexShader: `precision mediump float;
            precision mediump int;
            attribute vec4 color;
            varying vec2 vUv;
            varying float vFade;
            void main()	{
              vUv = uv;
              vec4 localPosition = vec4( position, 1);
              vFade = clamp((localPosition.y + 3.0) / 6.0, 0.0, 1.0);
              gl_Position = projectionMatrix * modelViewMatrix * localPosition;
            }`,
      fragmentShader: `precision mediump float;
            precision mediump int;
            uniform float time;
            uniform float blend;
            uniform sampler2D blendPattern;
            varying float vFade;
            varying vec2 vUv;


            void main()	{

                vec4 startColor = vec4(1., 0.5, 0.1, 1.0);
                vec4 endColor = vec4(0.2, 0.2, 0.2, 1.0);

              float dissolve = texture2D(blendPattern, vUv).r * 0.5;

              float spread = 0.4;

              float fadeAmount = smoothstep(
                max(0.0, vFade - spread),
                min(1.0, vFade + spread),
                blend + dissolve
              );

              vec4 color = mix(
                startColor, endColor,
                smoothstep(0.1,1., fadeAmount)
              );

              gl_FragColor = vec4(color.rgb, 1.-fadeAmount);
            }`,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this._light = new THREE.PointLight(0xff5500, 1, 100);
    this._light.position.set(0, 0.4, 0);
    this._lightIntensity = Math.random() * 5;

    this._object.add(this._light);
    // this._fireMaterial = new THREE.MeshStandardMaterial(0x661100);

    for (var i = 0; i < density; i++) {
      let geometry = new THREE.SphereGeometry(1, 32, 32);
      let mat = this._fireMaterial.clone();
      mat.uniforms.blendPattern.value = texture;
      mat.needsUpdate = true;
      let sphere = new THREE.Mesh(geometry, mat);
      sphere.position.y = Math.random() * height;
      sphere.position.x = (0.5 - Math.random()) * this._radius;
      sphere.position.z = (0.5 - Math.random()) * this._radius;
      sphere.rotateX(Math.random() * 5);
      sphere.rotateZ(Math.random() * 5);
      sphere.rotateY(Math.random() * 5);
      // @ts-ignore
      sphere.dirX = (0.5 - Math.random()) * 0.006;
      // @ts-ignore
      sphere.dirY = 0.006;
      // @ts-ignore
      sphere.dirZ = (0.5 - Math.random()) * 0.006;

      this._fireballs.push(sphere);
    }

    this._object.add(...this._fireballs);
  }

  private _update(): void {
    this._fireballs.forEach(ball => {
      ball.position.y += ball.dirY;
      ball.position.x += Math.sin(ball.position.y) * ball.dirX;
      ball.position.z += Math.cos(ball.position.y) * ball.dirZ;
      if (ball.position.y > this._height) {
        ball.position.y = Math.random() * 0.1;
        ball.position.x = (0.5 - Math.random()) * this._radius;
        ball.position.z = (0.5 - Math.random()) * this._radius;
      }

      let p = 0.1 + ball.position.y / this._height;
      ball.rotateX((1.2 - p) * 0.01);
      ball.rotateZ((1.2 - p) * 0.01);
      ball.rotateY((1.2 - p) * 0.01);
      ball.scale.set(p, p, p);
      /// ball.opacity = p;
      ball.material.uniforms.blend.value = p;
      // ball.material.needsUpdate = true;
    });

    this._light.intensity += (this._lightIntensity - this._light.intensity) * 0.006;

    if (Math.random() > 0.8) {
      this._lightIntensity = Math.random() * 5;
    }
  }

  public removed() {
    const {
      map,
      layerId,
      features: { features }
    } = this;
    if (map && layerId && features.length) {
      features.forEach((feature, index) => {
        let geometry = feature.geometry;
        if (geometry.type === 'Point') {
          const featureLayerId = `${layerId}-${index}`;
          map.getLayer(featureLayerId) && map.removeLayer(featureLayerId);
        }
      });
    }
  }
}
