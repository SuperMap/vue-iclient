import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import isEqual from 'lodash.isequal';

interface scanEffect {
  status?: boolean;
  type?: 'circle' | 'noScan' | 'line';
  centerPostion?: { x: number; y: number; z: number } | {};
  period?: number;
  speed?: number;
}
interface cesiumOptions {
  withCredentials?: boolean;
  position?: { x: number; y: number; z: number };
  scanEffect?: scanEffect;
}

export default class WebSceneViewModel extends mapboxgl.Evented {
  public Cesium: any;
  public scene: any;

  public sceneUrl: string;

  sceneParam: any;

  scanEffect: scanEffect;

  withCredentials: boolean;

  fire: any;

  on: any;

  position: any;

  viewer: any;

  constructor(Cesium, viewer, sceneUrl, options: cesiumOptions = {}) {
    super();
    if (!Cesium) {
      return;
    }
    if (!viewer) {
      return;
    }
    this.Cesium = Cesium;
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.scanEffect = options.scanEffect || {
      status: false,
      type: 'noScan',
      centerPostion: {},
      period: 2000,
      speed: 500
    };
    this.withCredentials = options.withCredentials || false;
    this.position = options.position || {};
    this.setSceneUrl(sceneUrl);
  }

  public setSceneUrl(url) {
    if (!url) {
      return;
    }
    if (url.indexOf('iserver') >= 0) {
      this.sceneUrl = url;
      this._createScene();
    } else {
      this._getSceneInfo(url);
    }
  }

  public setScanEffect(scanEffect) {
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

  public setPosition(position) {
    if (!isEqual(this.position, position)) {
      this.position = position;
      if (this.scene && position) {
        let sc = this.scene.camera;
        this.scene.camera.setView({
          destination: position,
          orientation: {
            heading: sc.heading,
            pitch: sc.pitch,
            roll: sc.roll
          }
        });
      }
    }
  }

  private _getSceneInfo(url) {
    SuperMap.FetchRequest.get(url + '.json', {}, { withCredentials: this.withCredentials })
      .then(response => {
        return response.json();
      })
      .then(result => {
        let { url } = result;
        // 检查是否公开or私有
        this.sceneUrl = url;
        this._checkPrivate(result);
      });
  }

  private _checkPrivate(result) {
    let { authorizeSetting, url, content } = result;
    const contentObj = JSON.parse(content);
    if (!url && contentObj.layers.length > 0) {
      this.sceneUrl = contentObj.layers[0].url;
    }
    let isPublic = false; // 默认私有
    authorizeSetting.map(item => {
      if (item.entityType === 'USER' && item.entityName === 'GUEST') {
        isPublic = true;
      }
    });
    if (!isPublic) {
      this.fire('sceneisprivate');
      return;
    }
    this.sceneUrl && this._createScene();
  }

  private _createScene() {
    this.scene && this.scene.layers.removeAll();
    let sceneParam = this._getSceneParam();
    let sceneUrl = sceneParam.sceneUrl;
    sceneUrl = sceneUrl.slice(0, sceneUrl.indexOf('/rest/realspace') + 15);
    let promise = this.scene.open(sceneUrl);
    this.scene.fxaa = true;
    this.scene.skyAtmosphere.show = true;
    this.Cesium.when.all(promise, () => {
      let sc = this.scene.camera;
      this.scene.camera.setView({
        // 设置三维笛卡尔坐标点
        destination:
          (this.position.x && this.position) || this.Cesium.Cartesian3(sc.position.x, sc.position.y, sc.position.z),
        orientation: {
          heading: sc.heading,
          pitch: sc.pitch,
          roll: sc.roll
        }
      });
      // 捕获三维场景上的鼠标事件，用于高亮场景组件
      let handler = new this.Cesium.ScreenSpaceEventHandler(this.scene.canvas);
      handler.setInputAction(e => {
        let sceneParam = this._getSceneParam();
        sceneParam.position = new this.Cesium.Cartesian3(sc.position.x, sc.position.y, sc.position.z);
        this.fire('viewerpositionchanged', { position: sceneParam.position });
        if (sceneParam.scanEffect.status && sceneParam.scanEffect.type !== 'noScan') {
          // 获取鼠标屏幕坐标,并将其转化成笛卡尔坐标
          let position = e.position;
          let last = this.scene.pickPosition(position);
          this.scene.scanEffect.centerPostion = last; // 设置扫描中心点
          sceneParam.scanEffect.centerPostion = last;
          this.scanEffect.centerPostion = last;
          this.fire('scanpositionchanged', { position: sceneParam.position });
        }
      }, this.Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.setInputAction(() => {
        sceneParam.position = new this.Cesium.Cartesian3(sc.position.x, sc.position.y, sc.position.z);
        this.fire('viewerpositionchanged', { position: sceneParam.position });
      }, this.Cesium.ScreenSpaceEventType.LEFT_UP);
      // 恢复状态时，恢复扫描效果,加赞三维场景比较卡，所以延迟2秒后再加载光线效果
      if (sceneParam.scanEffect.status && sceneParam.scanEffect.type !== 'noScan') {
        setTimeout(() => {
          this._startScan(sceneParam.scanEffect.type);
        }, 3000);
      }
      this.sceneParam = sceneParam;
    });
  }

  private _getSceneParam() {
    return {
      sceneUrl: this.sceneUrl,
      position: null,
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

  private _startScan(type) {
    let sc = this.scene.camera;
    this.scene.scanEffect.show = false;
    this.scene.scanEffect.mode = type === 'line' ? this.Cesium.ScanEffectMode.LINE : this.Cesium.ScanEffectMode.CIRCLE;
    let scanEffectPosition = this.sceneParam.scanEffect.centerPostion || this.scanEffect.centerPostion || {};
    if (scanEffectPosition.x) {
      this.scene.scanEffect.centerPostion = this.scanEffect.centerPostion || this.sceneParam.scanEffect.centerPostion;
    } else {
      this.sceneParam.scanEffect.centerPostion = new this.Cesium.Cartesian3(
        sc.position.x,
        sc.position.y,
        sc.position.z
      );
      this.scene.scanEffect.centerPostion = new this.Cesium.Cartesian3(sc.position.x, sc.position.y, sc.position.z);
    }
    this.scene.scanEffect.color = this.Cesium.Color.CORNFLOWERBLUE;
    // @ts-ignore
    this.scene.scanEffect._period = parseFloat(this.scanEffect.period);
    // @ts-ignore
    this.scene.scanEffect.speed = parseFloat(this.scanEffect.speed);
    this.scene.scanEffect.show = true;
  }
}
