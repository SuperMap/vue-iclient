import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';
import isEqual from 'lodash.isequal';
import { loadSecureScript, loadLink } from 'vue-iclient-core/utils/util';
import sceneEvent from 'vue-iclient-core/types/scene-event';

declare global {
  interface Window {
    SuperMap3D: any;
    openTianditu: any;
    openExistScene: any;
    OpenConfig: any;
  }
}
interface scanEffect {
  status?: boolean;
  type?: 'circle' | 'noScan' | 'line';
  centerPostion?: { x: number; y: number; z: number } | Object;
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
  openConfigPath: string;
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
  constructor(target: string, sceneUrl: string, options: cesiumOptions = {}, widgetsPath: string, cesiumPath: string, openConfigPath: string) {
    super();
    this.target = target;
    this.scanEffect = options.scanEffect || {
      status: false,
      type: 'noScan',
      centerPostion: {},
      period: 2000,
      speed: 500
    };
    this.options = options;
    this.widgetsPath = widgetsPath;
    this.cesiumPath = cesiumPath;
    this.openConfigPath = openConfigPath;
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
          loadSecureScript(this.openConfigPath).then(() => {
            this.initViewer();
            resolve(true);
          });
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
      timeline: true,
      navigation: true
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
      this.openTianditu(this.viewer, token, type, label);
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
    this.openExistScene(url[url.length - 1], this.viewer, serverUrl, this.options);
    this.scene.fxaa = true;
    this.handler = new window.SuperMap3D.ScreenSpaceEventHandler(this.scene.canvas);
    this.handler.setInputAction(e => {
      let sceneParam = this._getSceneParam();
      if (sceneParam.scanEffect.status && sceneParam.scanEffect.type !== 'noScan') {
        // 获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
        let position = e.position;
        let last = this.scene.pickPosition(position);
        this.scene.scanEffect.centerPostion = last; // 设置扫描中心点
        sceneParam.scanEffect.centerPostion = last;
        this.scanEffect.centerPostion = last;
        this.fire('scanpositionchanged', { centerPostion: last });
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

  getToken(url) {
    return new Promise((resolve, reject) => {
      let configTokenUrl = url + '/apps/config.rjson';
      fetch(configTokenUrl)
        .then((response) => response.json())
        .then(function (response) {
          let tiandituKey = '';
          let bingMapkey = '';
          if (response && response.commonConfig) {
            let commonConfig = JSON.parse(response.commonConfig);
            if (commonConfig.tiandituKey && commonConfig.tiandituKey !== '') {
              tiandituKey = commonConfig.tiandituKey;
            }

            if (commonConfig.bingMapsKey && commonConfig.bingMapsKey !== '') {
              bingMapkey = commonConfig.bingMapsKey;
            }
          }
          resolve({ tiandituKey, bingMapkey });
        })
        .catch(function (error) {
          console.log(error);
          reject(new Error('获取地图token配置信息失败'));
        });
    });
  }

  openExistScene(sceneID, viewer, serverUrl, options) {
    const rootUrl = serverUrl;
    const url = rootUrl + '/web/scenes/' + sceneID + '.json';
    this.getToken(rootUrl).then(({ tiandituKey, bingMapkey }) => {
      fetch(url)
        .then((response) => response.json())
        .then((response) => {
          if (response.content) {
            const openConfig = new window.OpenConfig(viewer, {
              tiandituKey, bingMapkey
            });
            const content = response.content.replaceAll('"./images/', `"${serverUrl}/apps/earth/v2/images/`);
            const data = JSON.parse(content);
            const promise = openConfig.openScene(data);

            window.SuperMap3D.when(promise, () => {
              sceneEvent.setScene(this.target, { viewer, content: data });
              sceneEvent.triggerLoadEvent(this.target);
            })

            if (
              options.position.destination.x !== null &&
              options.position.orientation &&
              options.position.orientation.pitch !== null
            ) {
              let { heading, roll, pitch } = options.position.orientation;
              heading = window.SuperMap3D.Math.toRadians(heading);
              roll = window.SuperMap3D.Math.toRadians(roll);
              pitch = window.SuperMap3D.Math.toRadians(pitch);
              viewer.scene.camera.setView({
                destination: window.SuperMap3D.Cartesian3.fromDegrees(
                  options.position.destination.x,
                  options.position.destination.y,
                  options.position.destination.z
                ),
                orientation: { heading, pitch, roll }
              });
            }
            if (options.tiandituOptions) {
              const { type, label, token } = options.tiandituOptions;
              this.openTianditu(this.viewer, token, type, label);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  }

  openTianditu(viewer, token, type, label) {
    viewer.imageryLayers.removeAll(true);
    const labelMap = {
      vec_w: 'cva_w',
      vec_c: 'cva_c',
      ter_w: 'cta_w',
      ter_c: 'cta_c',
      img_w: 'cia_w',
      img_c: 'cia_c'
    };
    viewer.imageryLayers.addImageryProvider(new window.SuperMap3D.TiandituImageryProvider({
      token: token,
      mapStyle: type
    }));
    if (label) {
      viewer.imageryLayers.addImageryProvider(new window.SuperMap3D.TiandituImageryProvider({
        token: token,
        mapStyle: labelMap[type]
      }));
    }
    sceneEvent.triggerLoadEvent(this.target);
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
        centerPostion: this.scanEffect.centerPostion || {},
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
    let scanEffectPosition = this.sceneParam.scanEffect.centerPostion || this.scanEffect.centerPostion || {};
    if (scanEffectPosition.x) {
      this.scene.scanEffect.centerPostion = this.sceneParam.scanEffect.centerPostion;
    } else {
      this.sceneParam.scanEffect.centerPostion = new window.SuperMap3D.Cartesian3(
        sc.position.x,
        sc.position.y,
        sc.position.z
      );
      this.scene.scanEffect.centerPostion = new window.SuperMap3D.Cartesian3(sc.position.x, sc.position.y, sc.position.z);
    }
    this.scene.scanEffect.color = window.SuperMap3D.Color.CORNFLOWERBLUE;
    // @ts-ignore
    this.scene.scanEffect._period = parseFloat(this.scanEffect.period);
    // @ts-ignore
    this.scene.scanEffect.speed = parseFloat(this.scanEffect.speed);
    this.scene.scanEffect.show = true;
  }
}
