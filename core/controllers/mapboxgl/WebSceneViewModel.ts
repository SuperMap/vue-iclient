import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';
import isEqual from 'lodash.isequal';
import { loadSecureScript, loadLink } from 'vue-iclient-core/utils/util';
import { openExistScene, openTianditu } from 'vue-iclient-core/utils/open-scene';

declare global {
  interface Window {
    SuperMap3D: any;
    openTianditu: any;
    openExistScene: any;
  }
}
interface scanEffect {
  status?: boolean;
  type?: 'circle' | 'noScan' | 'line';
  centerPosition?: { x: number; y: number; z: number } | Object;
  period?: number;
  speed?: number;
}
interface cesiumOptions {
  withCredentials?: boolean;
  orientation?: any;
  position?: { x?: number; y?: number; z?: number };
  scanEffect?: scanEffect;
  tiandituOptions?: Object;
}

export default class WebSceneViewModel extends mapboxgl.Evented {
  scene: any;
  sceneUrl: string;
  cesiumPath: string;
  widgetsPath: string;
  sceneParam: any;
  options: cesiumOptions;
  viewer: any;
  target: any;
  scanEffect: scanEffect;
  withCredentials: boolean;
  handler: any;
  position: any;
  orientation: any;
  fire: any;
  on: (name: string, data: (...rest: any) => void) => void;
  off: (name: string, data?: (...rest: any) => void) => void;
  constructor(target: string, sceneUrl: string, options: cesiumOptions = {}, widgetsPath: string, cesiumPath: string) {
    super();
    this.target = target;
    this.scanEffect = options.scanEffect || {
      status: false,
      type: 'noScan',
      centerPosition: {},
      period: 2000,
      speed: 500
    };
    this.options = options;
    this.widgetsPath = widgetsPath;
    this.cesiumPath = cesiumPath;
    this.position = options.position || {};
    this.orientation = options.orientation || {};
    if (sceneUrl) {
      this.sceneUrl = sceneUrl;
      this.init().then(() => {
        this._createScene(sceneUrl);
      });
    }
  }

  setSceneUrl(url) {
    if (!url) {
      return;
    }
    if (this.sceneUrl) {
      this._resetPosition();
    }
    this.sceneUrl = url;
    if (!this.viewer) {
      this.init().then(() => {
        this.setSceneUrl(url);
      });
    } else {
      this._createScene(url);
    }
  }

  init() {
    return new Promise((resolve) => {
      if (!window.SuperMap3D) {
        loadLink(this.widgetsPath);
        loadSecureScript(this.cesiumPath).then(() => {
          this.initViewer();
            resolve(true);
        });


      } else {
        setTimeout(() => {
          this.initViewer();
          resolve(true);
        }, 0);
      }
    });
  }

  initViewer() {
    this.viewer = new window.SuperMap3D.Viewer(this.target, {
      timeline: true
    });
    var infoBox = document.getElementsByClassName('supermap3d-infoBox-iframe')[0];
    if (infoBox) {
      infoBox.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
      infoBox.setAttribute('src', '');
    }
    this.viewer.timeline.container.style.visibility = 'hidden';
    this.viewer.Widget.creditContainer.style.visibility = 'hidden';
    this.viewer.resolutionScale = window.devicePixelRatio;
    this.scene = this.viewer.scene;
    this.fire('instancedidload', { instance: { Cesium: window.SuperMap3D, viewer: this.viewer } });
  }

  setScanEffect(scanEffect) {
    if (!isEqual(this.scanEffect, scanEffect)) {
      this.scanEffect = scanEffect;
      if (scanEffect.type === 'noScan') {
        this.scene && (this.scene.scanEffect.show = false);
        this.scene && (this.scene.scanEffect.type = scanEffect.type);
      } else {
        setTimeout(() => {
          this.scene && (this.scene.scanEffect.show = true);
          this._startScan(scanEffect.type);
        }, 100);
      }
    }
  }

  setTiandituOption(options) {
    if (this.viewer && options) {
      const { token, type, label } = options;
      openTianditu(this.viewer, token, type, label);
    }
  }

  setPosition(position, flyAnimation) {
    if (!isEqual(this.position, position)) {
      this.position = position;
      if (this.scene && position) {
        let { x, y, z } = position.destination;
        let { heading, roll, pitch } = position.orientation;
        heading = window.SuperMap3D.Math.toRadians(heading);
        roll = window.SuperMap3D.Math.toRadians(roll);
        pitch = window.SuperMap3D.Math.toRadians(pitch);
        const params = {
          duration: 1,
          destination: window.SuperMap3D.Cartesian3.fromDegrees(x, y, z),
          orientation: { heading, roll, pitch }
        };
        if (flyAnimation) {
          this.scene.camera.flyTo(params);
        } else {
          this.scene.camera.setView(params);
        }
      }
    }
  }

  removeInputAction() {
    if (!this.handler) return;
    this.handler.removeInputAction(window.SuperMap3D.ScreenSpaceEventType.LEFT_CLICK);
    window.SuperMap3D = null;
    this.scene = null;
    this.viewer = null;
    this.handler = null;
  }

  _resetPosition() {
    if (this.position) {
      this.position = {
        destination: { x: null, y: null, z: null },
        orientation: { heading: null, roll: null, pitch: null }
      };
      this.options.position = this.position;
    }
  }

  async _createScene(sceneUrl) {
    this.scene && this.scene.layers.removeAll();
    this.scene && this.scene._vectorTileMaps.removeAll();
    this.viewer.imageryLayers.removeAll();
    let sceneParam = this._getSceneParam();
    const url = sceneUrl.split('/');
    let serverUrl = sceneUrl.split('/web/scenes')[0];
    if (serverUrl === '/iportal') {
      serverUrl = location.origin + '/iportal';
    }
    // const iportalProxyUrl = await getiPortalServiceProxy();
    // if (iportalProxyUrl) {
    //   const formatUrl = new URL(iportalProxyUrl);
    //   window.SuperMap3D.TrustedServers.add(formatUrl.hostname, formatUrl.port || '8195');
    // }
    openExistScene(url[url.length - 1], this.viewer, serverUrl, this.options, this.target);
    this.scene.fxaa = true;
    this.handler = new window.SuperMap3D.ScreenSpaceEventHandler(this.scene.canvas);
    this.handler.setInputAction(e => {
      let sceneParam = this._getSceneParam();
      if (sceneParam.scanEffect.status && sceneParam.scanEffect.type !== 'noScan') {
        // 获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
        let position = e.position;
        let last = this.scene.pickPosition(position);
        this.scene.scanEffect.centerPosition = last; // 设置扫描中心点
        sceneParam.scanEffect.centerPosition = last;
        this.scanEffect.centerPosition = last;
        this.fire('scanpositionchanged', { centerPosition: last });
        this._startScan(this.scanEffect.type);
      }
    }, window.SuperMap3D.ScreenSpaceEventType.LEFT_CLICK);

    this.viewer.camera.moveEnd.addEventListener(() => {
      let position = this.getPosition();
      let orientation = this.getOrientation();
      this.fire('viewerpositionchanged', { position: { orientation, destination: position } });
    });
    if (sceneParam.scanEffect.status && sceneParam.scanEffect.type !== 'noScan') {
      this.viewer.scene.globe.tileLoadProgressEvent.addEventListener(() => {
        if (this.viewer.scene.globe.tilesLoaded) {
          setTimeout(() => {
            if (!this.scene.scanEffect.show) {
              this._startScan(sceneParam.scanEffect.type);
            }
          }, 4000);
        }
      });
    }
    this.sceneParam = sceneParam;
  }

  getPosition() {
    let camera = this.viewer.scene.camera;
    let position = camera.position;
    var cartographic = window.SuperMap3D.Cartographic.fromCartesian(position);
    var longitude = window.SuperMap3D.Math.toDegrees(cartographic.longitude);
    var latitude = window.SuperMap3D.Math.toDegrees(cartographic.latitude);
    var height = cartographic.height;
    return { x: longitude, y: latitude, z: height };
  }

  getOrientation() {
    let camera = this.viewer.scene.camera;
    let heading = camera.heading;
    let roll = camera.roll;
    let pitch = camera.pitch;
    roll = window.SuperMap3D.Math.toDegrees(roll);
    pitch = window.SuperMap3D.Math.toDegrees(pitch);
    heading = window.SuperMap3D.Math.toDegrees(heading);
    return { heading, roll, pitch };
  }

  _getSceneParam() {
    return {
      sceneUrl: this.sceneUrl,
      position: this.position,
      orientation: this.orientation,
      scanEffect: {
        status: this.scanEffect.status || false, // 是否为开启状态
        type: this.scanEffect.type || (this.scanEffect.status && 'circle') || 'noScan',
        centerPosition: this.scanEffect.centerPosition || {},
        _period: this.scanEffect.period || 2000,
        speed: this.scanEffect.speed || 500,
        color: null
      }
    };
  }

  _startScan(type) {
    let sc = this.scene.camera;
    this.scene.scanEffect.show = false;
    this.scene.scanEffect.mode = type === 'line' ? window.SuperMap3D.ScanEffectMode.LINE : window.SuperMap3D.ScanEffectMode.CIRCLE;
    let scanEffectPosition = this.sceneParam.scanEffect.centerPosition || this.scanEffect.centerPosition || {};
    if (scanEffectPosition.x) {
      this.scene.scanEffect.centerPosition = this.sceneParam.scanEffect.centerPosition;
    } else {
      this.sceneParam.scanEffect.centerPosition = new window.SuperMap3D.Cartesian3(
        sc.position.x,
        sc.position.y,
        sc.position.z
      );
      this.scene.scanEffect.centerPosition = new window.SuperMap3D.Cartesian3(sc.position.x, sc.position.y, sc.position.z);
    }
    this.scene.scanEffect.color = window.SuperMap3D.Color.CORNFLOWERBLUE;
    // @ts-ignore
    this.scene.scanEffect._period = parseFloat(this.scanEffect.period);
    // @ts-ignore
    this.scene.scanEffect.speed = parseFloat(this.scanEffect.speed);
    this.scene.scanEffect.show = true;
  }
}
