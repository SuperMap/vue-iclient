import mapboxgl from 'mapbox-gl';
import isEqual from 'lodash.isequal';
import { loadSecureScript, loadLink } from 'vue-iclient-core/utils/util';
import sceneEvent from 'vue-iclient-core/types/scene-event';
import { isSceneEntityDataLayer, prepareSuperMap3DServiceAuth } from 'vue-iclient-core/utils/scene';

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
  iportalKey?: string;
  credential?: { value?: string; type?: string; rooturl?: string };
  orientation?: any;
  position?: { x?: number; y?: number; z?: number };
  scanEffect?: scanEffect;
  tiandituOptions?: Object;
}

export type SceneAppreciableLayerCategory =
  | 'imagLayers'
  | 'mvtLayers'
  | 's3mLayers'
  | 'dataLayers'
  | 'tinLayer';

export interface SceneAppreciableLayer {
  category: SceneAppreciableLayerCategory;
  id?: string;
  customName?: string;
  dataSourceName?: string;
  datasetName?: string;
  dataId?: string;
  withCredentials?: boolean;
  serviceType?: string;
  maximumLevel?: number;
  show: boolean;
  type?: string;
  url?: string;
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
    return new Promise((resolve, reject) => {
      this._ensureSceneLibs()
        .then(() => {
          this.initViewer();
          resolve(true);
        })
        .catch(reject);
    });
  }

  _ensureSceneLibs() {
    const tasks: Promise<unknown>[] = [];
    if (!window.SuperMap3D) {
      tasks.push(loadLink(this.widgetsPath));
      tasks.push(
        loadSecureScript(this.cesiumPath).then(() => {
          if (!window.OpenConfig) {
            return loadSecureScript(this.openConfigPath);
          }
        })
      );
    } else if (!window.OpenConfig) {
      tasks.push(loadSecureScript(this.openConfigPath));
    }
    return Promise.all(tasks);
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
    // window.SuperMap3D = null;
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
    prepareSuperMap3DServiceAuth(sceneUrl, this.options.credential, this.options.iportalKey);
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

  getToken(url): Promise<{ tiandituKey: string; bingMapkey: string }> {
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

  /** 检查是否为 WebScene 保存的内容 */
  _checkInfoIsWebScene(info: any): boolean {
    return !!(info && info.extensions && info.scene && info.metadata);
  }

  /** 从 iPortal 场景数据中提取打开场景所需的信息 */
  _computedRequireInfoFromData(data: { content: any }): { sceneInfo?: any; webSceneContent?: any } | undefined {
    let content: any;
    if (data.content) {
      content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
    }

    // iEarth 和 WebScene 保存的场景信息统一放在 sceneInfo，通过内部属性区分
    let sceneInfo = content && content.sceneInfo;

    // 计算 WebScene
    let webSceneContent: any;
    if (this._checkInfoIsWebScene(data)) {
      // 直接导入的 webScene
      webSceneContent = data;
    } else if (this._checkInfoIsWebScene(content)) {
      // WebScene 直接放在 content 字段
      webSceneContent = content;
    } else if (this._checkInfoIsWebScene(sceneInfo)) {
      // WebScene 放在 content.sceneInfo 字段
      webSceneContent = sceneInfo;
    }

    // 既不是有效的 iEarth sceneInfo，也不是 WebScene
    if (sceneInfo && !sceneInfo.LayerOptions && !webSceneContent) {
      return;
    }

    return {
      // 有 WebScene 时优先走 WebScene 通道，不再走 OpenConfig
      sceneInfo: webSceneContent ? undefined : sceneInfo,
      webSceneContent
    };
  }

  openExistScene(sceneID, viewer, serverUrl, options) {
    const url = serverUrl + '/web/scenes/' + sceneID + '.json';
    this.getToken(serverUrl).then(({ tiandituKey, bingMapkey }) => {
      fetch(url)
        .then((response) => response.json())
        .then((response) => {
          if (!response.content) return;

          let content = response.content;
          if (typeof content === 'string') {
            content = JSON.parse(content.replace(/"\.\/images\//g, `"${serverUrl}/apps/earth/v2/images/`));
          }

          let sceneInfo: any;
          let webSceneContent: any;
          if (content.sceneInfo) {
            // 新版 iEarth 保存的信息
            const requireInfo = this._computedRequireInfoFromData({ content });
            if (!requireInfo) return;
            sceneInfo = requireInfo.sceneInfo;
            webSceneContent = requireInfo.webSceneContent;
          } else {
            // 老版 iEarth 保存的信息
            sceneInfo = content;
          }

          if (!sceneInfo && !webSceneContent) return;

          const onLoaded = (data: any) => {
            sceneEvent.setScene(this.target, { viewer, content: data, webscene: this });
            sceneEvent.triggerLoadEvent(this.target, this);
          };

          // 打开场景：走之前 iEarth 的场景保存逻辑
          if (sceneInfo) {
            if (!window.OpenConfig) return;
            const openConfig = new window.OpenConfig(viewer, { tiandituKey, bingMapkey });
            window.SuperMap3D.when(openConfig.openScene(sceneInfo), () => onLoaded(sceneInfo));
          }

          // 打开场景：走 WebScene 通道
          if (webSceneContent) {
            if (viewer.webScene) {
              viewer.webScene.fromJSON(webSceneContent);
              onLoaded(webSceneContent);
            } else {
              console.warn('当前依赖的SDK不支持WebScene');
            }
          }

          if (
            options.position?.destination?.x !== null &&
            options.position?.orientation &&
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
            const { type, label, token } = options.tiandituOptions as { type: string; label: boolean; token: string };
            this.openTianditu(this.viewer, token, type, label);
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
    sceneEvent.triggerLoadEvent(this.target, this);
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

  /**
   * 获取场景中可感知图层列表（影像 / MVT / S3M / 数据子图层 rest·iPortal·geoJSON / 地形），解析逻辑参考 scene-layer-list。
   */
  getAppreciableLayers(): SceneAppreciableLayer[] {
    if (!this.viewer) {
      return [];
    }
    const layers: SceneAppreciableLayer[] = [];
    layers.push(...this._getS3mAppreciableLayers());
    layers.push(...this._getImageryAppreciableLayers());
    layers.push(...this._getMvtAppreciableLayers());
    layers.push(...this._getRestDataAppreciableLayers());
    const tinLayer = this._getTinAppreciableLayer();
    if (tinLayer) {
      layers.push(tinLayer);
    }
    return layers;
  }

  _getS3mAppreciableLayers(): SceneAppreciableLayer[] {
    const layerQueue = this.viewer?.scene?.layers?._layerQueue || this.viewer?.scene?.layers?.layerQueue || [];
    return layerQueue.map((layer: any) => ({
      category: 's3mLayers' as const,
      id: layer?.name,
      customName: layer?.name,
      show: layer?.visible !== false,
      type: this._getObjectType(layer) || 'S3M',
      url: this._getLayerUrl(layer)
    }));
  }

  _getImageryAppreciableLayers(): SceneAppreciableLayer[] {
    const imageryLayers = this.viewer?.imageryLayers?._layers || [];
    const result: SceneAppreciableLayer[] = [];
    imageryLayers.forEach((layer: any) => {
      const provider = layer?.imageryProvider ?? layer?._imageryProvider;
      const customName = this._getImageryCustomName(provider);
      if (!customName || customName === 'Unnamed') {
        return;
      }
      const url = this._getImageryUrl(provider);
      // 优先读私有字段：公开 getter（maximumLevel/url）在 provider 未 ready 时会抛 DeveloperError
      const maximumLevel = this._getImageryMaximumLevel(provider);
      result.push({
        category: 'imagLayers',
        id: customName,
        customName,
        show: layer?.show !== false,
        type: this._getObjectType(provider) || 'ImageryProvider',
        url,
        ...(maximumLevel != null ? { maximumLevel } : {})
      });
    });
    return result;
  }

  _getImageryMaximumLevel(provider: any): number | undefined {
    if (!provider) {
      return undefined;
    }
    if (provider._maximumLevel != null) {
      return provider._maximumLevel;
    }
    if (provider.ready === false || provider._ready === false) {
      return undefined;
    }
    try {
      return provider.maximumLevel;
    } catch {
      return undefined;
    }
  }

  _getMvtAppreciableLayers(): SceneAppreciableLayer[] {
    const layerQueue = this.viewer?.scene?._vectorTileMaps?._layerQueue || [];
    return layerQueue.map((layer: any) => ({
      category: 'mvtLayers' as const,
      id: layer?.name,
      customName: layer?.name,
      show: layer?.show !== false,
      type: this._getObjectType(layer) || 'MVT',
      url: this._getLayerUrl(layer)
    }));
  }

  _getRestDataAppreciableLayers(): SceneAppreciableLayer[] {
    const collection = this.viewer?.dataSources;
    if (!collection) {
      return [];
    }
    const dataSources: any[] = [];
    if (typeof collection.length === 'number' && typeof collection.get === 'function') {
      for (let index = 0; index < collection.length; index++) {
        dataSources.push(collection.get(index));
      }
    } else if (Array.isArray(collection._dataSources)) {
      dataSources.push(...collection._dataSources);
    }

    return dataSources.reduce((layers: SceneAppreciableLayer[], dataSource: any) => {
      const entities = dataSource?.entities?.values || [];
      const entityLayerData = entities.find(
        (entity: any) => entity?.___layerFeatureData
      )?.___layerFeatureData;
      const layerData = dataSource?.___layerData || entityLayerData?.data;
      const config = layerData?.config;
      if (!isSceneEntityDataLayer(layerData) || dataSource?.___layerRemoved === true) {
        return layers;
      }
      const id = String(layerData.id || entityLayerData?.layerId || '').trim();
      const customName = String(layerData.name || dataSource?.name || id).trim();
      if (!id && !customName) {
        return layers;
      }
      const configType = String(config?.type || '');
      layers.push({
        category: 'dataLayers',
        id: id || customName,
        customName: customName || id,
        show: dataSource?.show !== false && dataSource?.entities?.show !== false,
        type: configType || 'data',
        serviceType:
          configType === 'iPortal' ? 'IPORTAL' : configType === 'geoJSON' ? 'GEOJSON' : 'REST_DATA',
        url: typeof config?.url === 'string' ? config.url : undefined,
        dataSourceName: config?.datasourceName,
        datasetName: config?.datasetName,
        dataId: typeof layerData.dataId === 'string' ? layerData.dataId : undefined,
        withCredentials: typeof config?.withCredentials === 'boolean' ? config.withCredentials : undefined
      });
      return layers;
    }, []);
  }

  _getTinAppreciableLayer(): SceneAppreciableLayer | null {
    const terrainProvider = this.viewer?.terrainProvider;
    if (!terrainProvider) {
      return null;
    }
    const SuperMap3D = window.SuperMap3D;
    if (SuperMap3D?.EllipsoidTerrainProvider && terrainProvider instanceof SuperMap3D.EllipsoidTerrainProvider) {
      return null;
    }
    const url = this._getTerrainUrl(terrainProvider);
    const customName = this._getTerrainCustomName(terrainProvider, url);
    if (!customName || customName === 'invisible') {
      return null;
    }
    return {
      category: 'tinLayer',
      id: customName,
      customName,
      show: true,
      type: this._getObjectType(terrainProvider) || 'TerrainProvider',
      url
    };
  }

  _getImageryUrl(provider: any) {
    if (!provider) {
      return undefined;
    }
    // 优先私有字段，避免 provider 未 ready 时访问公开 url getter 抛错
    if (typeof provider._url === 'string') {
      return provider._url;
    }
    if (typeof provider.tablename === 'string') {
      return provider.tablename;
    }
    try {
      return typeof provider.url === 'string' ? provider.url : undefined;
    } catch {
      return undefined;
    }
  }

  _getImageryCustomName(provider: any) {
    if (!provider) {
      return undefined;
    }
    const imageUrl = this._getImageryUrl(provider);
    if (!imageUrl) {
      return undefined;
    }
    if (imageUrl.includes('earth-skin2.jpg')) {
      return 'defaultImage';
    }
    if (imageUrl.includes('tianditu.gov.cn')) {
      return 'TIANDITU';
    }
    if (imageUrl.includes('./images/baseMap/baseImage.jpg')) {
      return 'LocalImage';
    }
    if (imageUrl.includes('dev.virtualearth.net')) {
      return 'BingMap';
    }
    if (imageUrl.includes('GRIDIMAGERY')) {
      return 'GRIDIMAGERY';
    }
    if (imageUrl.includes('openstreetmap.fr')) {
      return 'OSM';
    }
    if (imageUrl.includes('realspace/datas/')) {
      return this._normalizeLayerName(imageUrl.split('realspace/datas/')[1]);
    }
    return this._getTableName(provider.tablename) || this._getNameFromUrl(imageUrl) || 'Unnamed';
  }

  _normalizeLayerName(name?: string) {
    if (!name || typeof name !== 'string') {
      return undefined;
    }
    return name.replace(/\/+$/, '') || undefined;
  }

  _getTableName(tableName?: string) {
    if (!tableName || typeof tableName !== 'string' || tableName.includes('http')) {
      return undefined;
    }
    if (tableName.includes('/rest/maps/')) {
      const name = tableName.split('/rest/maps/')[1];
      try {
        const decodedName = name.includes('%') ? decodeURIComponent(name) : name;
        return this._normalizeLayerName(decodedName.split('@')[0]);
      } catch {
        return this._normalizeLayerName(name.split('@')[0]);
      }
    }
    if (tableName.includes('%')) {
      return this._normalizeLayerName(tableName.split('%')[0]);
    }
    if (tableName.includes('/maps/')) {
      return this._normalizeLayerName(tableName.split('/maps/')[1]);
    }
    return this._normalizeLayerName(tableName);
  }

  _getNameFromUrl(url: string) {
    if (!url) {
      return undefined;
    }
    if (url.includes('/rest/maps/')) {
      const name = url.split('/rest/maps/')[1];
      try {
        const decodedName = name ? (name.includes('%') ? decodeURIComponent(name) : name) : undefined;
        return this._normalizeLayerName(decodedName?.split('@')[0]);
      } catch {
        return this._normalizeLayerName(name?.split('@')[0]);
      }
    }
    if (url.includes('/realspace/datas/')) {
      return this._normalizeLayerName(url.split('/realspace/datas/')[1]);
    }
    return undefined;
  }

  _getLayerUrl(layer: any) {
    if (!layer) {
      return undefined;
    }
    const url = layer.url ?? layer._url ?? layer.baseUri ?? layer._baseUri ?? layer._baseUrl;
    return typeof url === 'string' ? url : undefined;
  }

  _getTerrainUrl(terrainProvider: any) {
    if (!terrainProvider) {
      return undefined;
    }
    if (typeof terrainProvider._baseUrl === 'string') {
      return terrainProvider._baseUrl;
    }
    if (Array.isArray(terrainProvider._urls) && typeof terrainProvider._urls[0] === 'string') {
      return terrainProvider._urls[0];
    }
    return this._getLayerUrl(terrainProvider);
  }

  _getTerrainCustomName(terrainProvider: any, url?: string) {
    const baseUrl = url || this._getTerrainUrl(terrainProvider);
    if (terrainProvider?._baseUrl || (baseUrl && !terrainProvider?._urls)) {
      if (!baseUrl) {
        return 'invisible';
      }
      if (baseUrl.indexOf('3D-stk_terrain') !== -1) {
        return 'STKTerrain';
      }
      if (baseUrl.includes('info/data/path')) {
        return baseUrl.split('/services/')[1]?.split('/rest/')[0];
      }
      if (baseUrl.includes('/realspace/datas/')) {
        return baseUrl.split('/realspace/datas/')[1]?.replace(/\/$/, '');
      }
      if (baseUrl.indexOf('supermapol.com') !== -1) {
        return baseUrl.split('realspace/services/')[1]?.split('/rest/realspace')[0];
      }
      if (baseUrl.indexOf('iserver/services') !== -1) {
        return baseUrl.split('iserver/services/')[1]?.split('/rest/realspace')[0];
      }
      return 'invisible';
    }
    if (terrainProvider?._urls) {
      const url0 = terrainProvider._urls[0] || baseUrl || '';
      if (url0.indexOf('supermapol.com') !== -1) {
        return 'SuperMapTerrain';
      }
      return 'TiandituTerrain';
    }
    return 'invisible';
  }

  _getObjectType(obj: any) {
    if (!obj) {
      return undefined;
    }
    const name = obj.constructor?.name;
    return typeof name === 'string' && name && name !== 'Object' ? name : undefined;
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
    let scanEffectPosition =  this.scanEffect.centerPostion || this.sceneParam.scanEffect.centerPostion || {};
    if (scanEffectPosition.x) {
      this.scene.scanEffect.centerPostion = scanEffectPosition;
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
