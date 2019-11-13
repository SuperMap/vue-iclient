import L from 'leaflet';
import '../../../static/libs/iclient-leaflet/iclient-leaflet.min';
// import echarts from 'echarts';  // TODO iclient 拿不到 echarts ???
import '../../../static/libs/geostats/geostats';
import '../../../static/libs/json-sql/jsonsql';
import { isXField, isYField } from '../../common/_utils/util';
import getCenter from '@turf/center';
import canvg from 'canvg';
import isNumber from 'lodash.isnumber';
import provincialCenterData from '../../common/_utils/config/ProvinceCenter.json';
import municipalCenterData from '../../common/_utils/config/MunicipalCenter.json';
import { getColorWithOpacity } from '../../common/_utils/util';

interface webMapOptions {
  target?: string;
  serverUrl?: string;
  accessToken?: string;
  accessKey?: string;
  tiandituKey?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  isSuperMapOnline?: boolean;
}

interface mapOptions {
  center?: number[] | L.LatLng;
  zoom?: number;
  maxBounds?: [[number, number], [number, number]] | L.Bounds;
  minZoom?: number;
  maxZoom?: number;
  // layers?: L.Layer[];
  crs?: L.CRS;
  preferCanvas?: boolean;
}

// 迁徙图最大支持要素数量
const MAX_MIGRATION_ANIMATION_COUNT = 1000;

// TODO 坐标系 / noWrap
export default class WebMapViewModel extends L.Evented {
  map: L.Map;

  mapId: string;

  mapOptions: mapOptions;

  serverUrl: string;

  accessToken: string;

  accessKey: string;

  tiandituKey: string;

  withCredentials: boolean;

  target: string;

  excludePortalProxyUrl: boolean;

  isSuperMapOnline: boolean;

  center: number[] | L.LatLng;

  zoom: number;

  mapParams: { title?: string; description?: string };

  baseProjection: string;

  on: any;

  fire: any;

  echartslayer: any = [];

  layers: any = {};

  crs: L.CRS;

  private _taskID: Date;

  private _layers: any = [];

  private layerAdded: number;

  private _svgDiv: HTMLElement;

  private expectLayerLen: number;

  constructor(id, options: webMapOptions = {}, mapOptions: mapOptions = {}) {
    super();
    this.mapId = id;
    this.serverUrl = options.serverUrl || 'http://www.supermapol.com';
    this.accessToken = options.accessToken;
    this.accessKey = options.accessKey;
    this.tiandituKey = options.tiandituKey || '';
    this.withCredentials = options.withCredentials || false;
    this.target = options.target || 'map';
    this.excludePortalProxyUrl = options.excludePortalProxyUrl;
    this.isSuperMapOnline = options.isSuperMapOnline;
    this.echartslayer = [];
    this.center = mapOptions.center || [];
    this.zoom = mapOptions.zoom;
    this.mapOptions = mapOptions;
    this._createWebMap();
  }

  public setZoom(zoom) {
    if (this.map) {
      this.mapOptions.zoom = zoom;
      (zoom || zoom === 0) && this.map.setZoom(zoom);
    }
  }

  public setMinZoom(minZoom): void {
    if (this.map) {
      this.mapOptions.minZoom = minZoom;
      (minZoom || minZoom === 0) && this.map.setMinZoom(minZoom);
    }
  }

  public setMaxZoom(maxZoom): void {
    if (this.map) {
      this.mapOptions.maxZoom = maxZoom;
      (maxZoom || maxZoom === 0) && this.map.setMinZoom(maxZoom);
    }
  }

  public setCenter(center): void {
    if (this.map) {
      this.mapOptions.center = center;
      center && (<[number, number]>center).length > 0 && this.map.setView(center, this.zoom);
    }
  }

  public setMaxBounds(maxBounds): void {
    if (this.map) {
      this.mapOptions.maxBounds = maxBounds;
      maxBounds && (<[[number, number], [number, number]]>maxBounds).length > 0 && this.map.setMaxBounds(maxBounds);
    }
  }

  public echartsLayerResize(): void {
    this.echartslayer.forEach(echartslayer => {
      echartslayer.chart.resize();
    });
  }

  public setMapId(mapId: string): void {
    this.mapId = mapId;
    setTimeout(() => {
      this._createWebMap();
    }, 0);
  }

  public setServerUrl(serverUrl: string): void {
    this.serverUrl = serverUrl;
  }

  public setWithCredentials(withCredentials) {
    this.withCredentials = withCredentials;
  }

  private _createWebMap(): void {
    if (this.map) {
      this.map.remove();
      this.center = [];
      this.zoom = null;
    }
    if (!this.mapId || !this.serverUrl) {
      this.map = L.map(this.target, {
        center: (<number[]>this.center).length ? L.latLng(this.center[0], this.center[1]) : [0, 0],
        zoom: this.zoom || 0,
        crs: this.mapOptions.crs || L.CRS.EPSG3857,
        maxZoom: this.mapOptions.maxZoom || 22,
        minZoom: this.mapOptions.minZoom || 0,
        // layers: this.mapOptions.layers,
        preferCanvas: this.mapOptions.preferCanvas || true
      });

      // load 监听失败 TODO

      // this.map.on('load', () => {
      setTimeout(() => {
        this.fire('addlayerssucceeded', {
          map: this.map,
          mapparams: {},
          layers: []
        });
      }, 0)
      // });
      return;
    }

    this._taskID = new Date();
    let mapUrl = this._getMapUrl();
    this._getMapInfo(mapUrl, this._taskID);
  }

  private _getMapUrl() {
    let urlArr: string[] = this.serverUrl.split('');
    if (urlArr[urlArr.length - 1] !== '/') {
      this.serverUrl += '/';
    }
    let mapUrl = this.serverUrl + 'web/maps/' + this.mapId + '/map';
    if (this.accessToken || this.accessKey) {
      mapUrl += '?' + (this.accessToken && !this.accessKey) ? 'token=' + this.accessToken : 'key=' + this.accessKey;
    }
    let filter = 'getUrlResource.json?url=';
    if (this.excludePortalProxyUrl && this.serverUrl.indexOf(filter) > -1) {
      // 大屏需求,或者有加上代理的
      let urlArray: string[] = this.serverUrl.split(filter);
      if (urlArray.length > 1) {
        mapUrl = urlArray[0] + filter + this.serverUrl + 'web/maps/' + this.mapId + '/map.json';
      }
    }
    return mapUrl;
  }

  private _getMapInfo(url: string, _taskID): void {
    let mapUrl: string = url.indexOf('.json') === -1 ? `${url}.json` : url;
    SuperMap.FetchRequest.get(mapUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(mapInfo => {
        if (mapInfo && mapInfo.succeed === false) {
          /**
           * @event WebMapViewModel#getmapinfofailed
           * @description 获取地图信息失败。
           * @property {Object} error - 失败原因。
           */
          let error = { message: mapInfo && mapInfo.error && mapInfo.error.errorMsg };
          this.fire('getmapinfofailed', { error });
          console.log(error);
          return;
        }
        let { projection, title, description, layers, baseLayer } = mapInfo;

        this.baseProjection = projection;

        // 存储地图的名称以及描述等信息，返回给用户
        this.mapParams = { title, description };

        // 坐标系异常处理
        this._createMap(mapInfo);

        // 无法 on 到 load 事件  TODO
        // this.map.on('load', () => {
        if (baseLayer && baseLayer.layerType === 'MAPBOXSTYLE') {
          // 添加矢量瓦片服务作为底图 TODO-------------------MVT
          // this._addMVTBaseMap(mapInfo);
        } else {
          this._createBaseLayer(mapInfo, false);
        }
        if (!layers || layers.length === 0) {
          this._sendMapToUser(0, 0);
        } else {
          this._addLayers(layers, _taskID);
        }
        // });
      })
      .catch(error => {
        this._addLayerSucceeded();
        /**
         * @event WebMapViewModel#getmapinfofailed
         * @description 获取地图信息失败。
         * @property {Object} error - 失败原因。
         */
        this.fire('getmapinfofailed', { error: error });
      });
  }

  private _createMap(mapInfo: any): void {
    let { level, maxZoom, minZoom, baseLayer } = mapInfo;

    // zoom & center
    let center: [number, number] | L.LatLng;
    center = mapInfo.center && [mapInfo.center.x, mapInfo.center.y];
    let zoom = level || 0;
    zoom = zoom === 0 ? 0 : zoom;

    if (!center) {
      center = [0, 0];
    }

    // crs 坐标系处理待优化
    let epsgCode = this.baseProjection.split(':')[1];
    let crs = L.CRS[`EPSG${epsgCode}`];

    if (baseLayer.layerType === 'BAIDU') {
      // @ts-ignore
      crs = L.CRS.Baidu;
    }

    if (baseLayer.layerType.indexOf('TIANDITU') > -1) {
      // @ts-ignore
      crs = this.baseProjection === 'EPSG:3857' ? L.CRS.TianDiTu_Mercator : L.CRS.TianDiTu_WGS84;
    }

    // bounds
    // let bounds = L.bounds([extent.leftBottom.x, extent.leftBottom.y], [extent.rightTop.x, extent.rightTop.y]);
    center =
      this.baseProjection === 'EPSG:3857'
        ? crs.unproject(L.point(center[0], center[1]))
        : L.latLng(center[1], center[0]);
    // 初始化 map
    this.map = L.map(this.target, {
      center: (<number[]>this.center).length ? L.latLng(this.center[0], this.center[1]) : center,
      zoom: this.zoom || zoom,
      crs,
      maxZoom: maxZoom || 22,
      minZoom: minZoom || 0,
      preferCanvas: true // unicode marker 需要canvas
    });

    // this.map.fitBounds(L.latLngBounds(crs.unproject(bounds.min), crs.unproject(bounds.max)), {
    //   maxZoom: maxZoom || 22
    // });
    this.crs = crs;
    /**
     * @event WebMapViewModel#mapinitialized
     * @description Map 初始化成功。
     * @property {L.Map} map - Leaflet Map 对象。
     */
    this.fire('mapinitialized', { map: this.map });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createBaseLayer
   * @description 创建底图。
   * @param {Object} mapInfo - map 信息。
   */
  private _createBaseLayer(mapInfo: any, sendToMap = true): void {
    let layerInfo = mapInfo.baseLayer || mapInfo;
    let layerType = layerInfo.layerType; // 底图和rest地图兼容

    if (
      layerType.indexOf('TIANDITU_VEC') > -1 ||
      layerType.indexOf('TIANDITU_IMG') > -1 ||
      layerType.indexOf('TIANDITU_TER') > -1
    ) {
      layerType = layerType.substr(0, 12);
    }

    let mapUrls = {
      CLOUD: 'http://t2.supermapcloud.com/FileService/image',
      CLOUD_BLACK: 'http://t3.supermapcloud.com/MapService/getGdp',
      OSM: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      GOOGLE:
        'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0',
      GOOGLE_CN: 'https://mt{0-3}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
      JAPAN_STD: 'http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
      JAPAN_PALE: 'http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      JAPAN_RELIEF: 'http://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
      JAPAN_ORT: 'http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg'
    };

    let url: string;
    let layer;
    switch (layerType) {
      case 'TIANDITU_VEC':
      case 'TIANDITU_IMG':
      case 'TIANDITU_TER':
        this._createTiandituLayer(layerInfo);
        break;
      case 'BING':
        layer = this._createBingLayer(layerInfo.name);
        break;
      case 'WMS':
        layer = this._createWMSLayer(layerInfo);
        break;
      case 'WMTS':
        layer = this._createWMTSLayer(layerInfo);
        break;
      case 'TILE':
      case 'SUPERMAP_REST':
        layer = this._createDynamicTiledLayer(layerInfo);
        break;
      case 'CLOUD':
      case 'CLOUD_BLACK':
        url = mapUrls[layerType];
        layer = this._createCLOUDLayer(layerType, url);
        break;
      case 'OSM':
      case 'JAPAN_ORT':
      case 'JAPAN_RELIEF':
      case 'JAPAN_PALE':
      case 'JAPAN_STD':
      case 'GOOGLE_CN':
      case 'GOOGLE':
        url = mapUrls[layerType];
        layer = this._createXYZLayer(layerInfo, url);
        break;
      case 'BAIDU':
        layer = this._createBaiduTileLayer();
        break;
      default:
        break;
    }
    layer && this._addLayerToMap(layer, 'baseLayers', layerInfo.name, layerInfo.visible, sendToMap);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._addLayers
   * @description 添加叠加图层。
   * @param {Object} mapInfo - 图层信息。
   */
  private _addLayers(layers: any, _taskID): void {
    // 存储地图上所有的图层对象
    this._layers = layers;
    let len = layers.length;
    this.layerAdded = 0;
    this.expectLayerLen = len;
    if (len > 0) {
      layers.forEach((layer, index) => {
        let type = this._getType(layer);
        switch (type) {
          case 'hosted':
            //数据存储到iportal上了
            this._getFeaturesFromHosted({ layer, index, len, _taskID });
            break;
          case 'tile':
            this._createBaseLayer(layer);
            break;
          case 'rest_data':
            this._getFeaturesFromRestData({ layer, index, len });
            break;
          case 'rest_map':
            this._getFeaturesFromRestMap({ layer, index, len });
            break;
          case 'dataflow':
            this._getFeaturesFromDataflow({ layer, index, len });
            break;
        }
      }, this);
    }
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._addLayer
   * @description 将单个图层添加到地图上。
   * @param layerInfo  某个图层的图层信息
   * @param {Array.<GeoJSON>} features - feature。
   */
  private async _addLayer(layerInfo: any, features: any, index: number | string): Promise<void> {
    try {
      layerInfo.layerID = layerInfo.name + '-' + index;
      let { layerType, style, themeSetting, filterCondition, projection, featureType, labelStyle } = layerInfo;

      if ((style || themeSetting) && filterCondition) {
        // 将 feature 根据过滤条件进行过滤, 分段专题图和单值专题图因为要计算 styleGroup 所以暂时不过滤
        if (layerType !== 'RANGE' && layerType !== 'UNIQUE' && layerType !== 'RANK_SYMBOL') {
          features = this._getFiterFeatures(filterCondition, features);
        }
      }

      if (features && projection && projection !== 'EPSG:4326') {
        this._transformFeatures(features);
      }

      let layer;
      switch (layerType) {
        case 'VECTOR':
          if (featureType === 'POINT') {
            if (style.type === 'SYMBOL_POINT') {
              layer = await this._createSymbolLayer(layerInfo, features);
            } else {
              layer = await this._createGraphicLayer(layerInfo, features);
            }
          } else {
            // 线和面
            layer = await this._createVectorLayer(layerInfo, features);
          }
          break;
        case 'UNIQUE':
          layer = await this._createUniqueLayer(layerInfo, features);
          break;
        case 'RANGE':
          layer = await this._createRangeLayer(layerInfo, features);
          break;
        case 'HEAT':
          layer = await this._createHeatLayer(layerInfo, features);
          break;
        case 'MARKER':
          layer = await this._createMarkerLayer(layerInfo, features);
          break;
        case 'RANK_SYMBOL':
          layer = await this._createRankSymbolLayer(layerInfo, features);
          break;
        case 'MIGRATION':
          layer = await this._createMigrationLayer(layerInfo, features);
          break;
        case 'DATAFLOW_POINT_TRACK':
        case 'DATAFLOW_HEAT':
          // this._createDataflowLayer(layerInfo);
          break;
      }

      layer && this._addLayerToMap(layer, 'overlays', layerInfo.layerID, layerInfo.visible);

      if (labelStyle && labelStyle.labelField && layerType !== 'DATAFLOW_POINT_TRACK') {
        // 存在标签专题图
        features = this._getFiterFeatures(filterCondition, features);
        let labelLayer = this._addLabelLayer(layerInfo, features);
        this._addLayerToMap(labelLayer, 'overlays', layerInfo.layerID, layerInfo.visible, false);
      }
    } catch (err) {
      console.error(err);
      this._addLayerSucceeded();
      this.fire('getlayerdatasourcefailed', {
        error: err,
        layer: null,
        map: this.map
      });
    }
  }


  private _createBingLayer(layerInfo) {
    let url = 'http://dynamic.t0.tiles.ditu.live.com/comp/ch/{quadKey}?it=G,TW,L,LA&mkt=zh-cn&og=109&cstl=w4c&ur=CN&n=z';
    // @ts-ignore
    L.TileLayer.BingLayer = L.TileLayer.extend({
      getTileUrl: function (coordinates) {
        let [z, x, y] = [...coordinates];
        y = y > 0 ? y - 1 : -y - 1;
        let index = '';
        for (let i = z; i > 0; i--) {
          let b = 0;
          let mask = 1 << (i - 1);
          if ((x & mask) !== 0) {
            b++;
          }
          if ((y & mask) !== 0) {
            b += 2;
          }
          index += b.toString()
        }
        return url.replace('{quadKey}', index);
      }
    })
    // @ts-ignore
    L.tileLayer.bingLayer = (url, options) => {
      // @ts-ignore
      return new L.TileLayer.BingLayer(url, options)
    }
    // @ts-ignore
    return L.tileLayer.bingLayer(url, {
      noWrap: true
    })
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createDynamicTiledLayer
   * @description 创建 iserver 底图。
   * @param {Object} layerInfo - 图层信息。
   */
  private _createDynamicTiledLayer(layerInfo: any): void {
    let url = layerInfo.url;
    // @ts-ignore
    let layer = L.supermap.tiledMapLayer(url, { noWrap: true });
    return layer;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createWMSLayer
   * @description 创建 WMS 图层。
   * @param {Object} layerInfo - 图层信息。
   */
  private _createWMSLayer(layerInfo: any) {
    let { url, layers } = layerInfo;
    if (!layers || layers === 'undefined' || layers === 'null') {
      layers = '0';
    } else if (layers.length > 0) {
      layers = layers[0];
    }
    return L.tileLayer.wms(url, {
      layers,
      format: 'image/png',
      transparent: true,
      noWrap: true
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createWMTSLayer
   * @description 创建 WMTS 底图。
   * @param {Object} layerInfo - 地图信息。
   */
  private _createWMTSLayer(layerInfo: any) {
    let { url, tileMatrixSet, name } = layerInfo;
    // @ts-ignore
    return L.supermap.wmtsLayer(url, {
      layer: name,
      style: 'default',
      tilematrixSet: tileMatrixSet,
      format: 'image/png',
      noWrap: true
    });
  }

  private _createTiandituLayer(layerInfo) {
    this.map.getZoom() < 1 && this.map.setZoom(1);
    this.map.setMinZoom(1);
    let layerType = layerInfo.layerType.split('_')[1].toLowerCase();
    let isLabel = Boolean(layerInfo.labelLayerVisible);
    // @ts-ignore
    let tiandituLayer = L.supermap.tiandituTileLayer({
      layerType,
      key: this.tiandituKey
    });
    // @ts-ignore
    let tiandituLabelLayer = L.supermap.tiandituTileLayer({
      layerType,
      isLabel: true,
      key: this.tiandituKey
    });
    this._addLayerToMap(tiandituLayer, 'overlays', layerInfo.name, layerInfo.visible);
    isLabel && this._addLayerToMap(tiandituLabelLayer, 'overlays', layerInfo.name + '-label', layerInfo.visible, false);
  }

  private _createCLOUDLayer(layerType, url) {
    if (layerType === 'CLOUD') {
      this.map.getZoom() < 3 && this.map.setZoom(3);
      this.map.setMinZoom(3);
    }
    // @ts-ignore
    return L.supermap.cloudTileLayer(url, { noWrap: true });
  }

  private _createXYZLayer(layerInfo, url) {
    return L.tileLayer(url, { noWrap: true });
  }

  private _createBaiduTileLayer() {
    this.map.getZoom() < 3 && this.map.setZoom(3);
    this.map.setMinZoom(3);
    // @ts-ignore
    return L.supermap.baiduTileLayer('', { noWrap: true });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createUniqueLayer
   * @description 创建单值图层。
   * @param layerInfo  某个图层的图层信息
   * @param features   图层上的 feature
   */
  private _createUniqueLayer(layerInfo: any, features: any) {
    return this._createThemeLayer('unique', layerInfo, features);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createRangeLayer
   * @description 创建分段图层。
   * @param layerInfo  某个图层的图层信息
   * @param features   图层上的 feature
   */
  private _createRangeLayer(layerInfo: any, features: any) {
    return this._createThemeLayer('range', layerInfo, features);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createMarkerLayer
   * @description 添加标记图层。
   * @param layerInfo  某个图层的图层信息
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createMarkerLayer(layerInfo: any, features: any): Promise<object> {
    return new Promise((resolve, reject) => {
      const layerGroupPromises =
        features &&
        features.map(feature => {
          return new Promise((resolve, reject) => {
            let geomType = feature.geometry.type.toUpperCase();
            let defaultStyle = feature.dv_v5_markerStyle;
            if (geomType === 'POINT' && defaultStyle.text) {
              // 说明是文字的feature类型
              geomType = 'TEXT';
            }
            let featureInfo = this._setFeatureInfo(feature);
            feature.properties['useStyle'] = defaultStyle;
            feature.properties['featureInfo'] = featureInfo;
            if (
              geomType === 'POINT' &&
              defaultStyle.src &&
              (defaultStyle.src.indexOf('http://') === -1 && defaultStyle.src.indexOf('https://') === -1)
            ) {
              // 说明地址不完整
              defaultStyle.src = this.serverUrl + defaultStyle.src;
            }

            // image-marker
            if (geomType === 'POINT' && defaultStyle.src && defaultStyle.src.indexOf('svg') <= -1) {
              resolve(
                L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                  icon: L.icon({
                    iconUrl: defaultStyle.src,
                    iconSize: [defaultStyle.imgWidth * defaultStyle.scale, defaultStyle.imgHeight * defaultStyle.scale],
                    iconAnchor: defaultStyle.anchor
                  })
                })
              );
            }

            // svg-marker
            if (geomType === 'POINT' && defaultStyle.src && defaultStyle.src.indexOf('svg') > -1) {
              if (!this._svgDiv) {
                this._svgDiv = document.createElement('div');
                document.body.appendChild(this._svgDiv);
              }
              this._getCanvasFromSVG(defaultStyle.src, this._svgDiv, canvas => {
                resolve(this._getSvgLayer(canvas, defaultStyle, [feature]));
              });
            }
            // point-line-polygon-marker
            if (!defaultStyle.src) {
              if ((geomType === 'LINESTRING' && defaultStyle.lineCap) || geomType === 'POLYGON') {
                resolve(
                  this._createGeojsonLayer(
                    [feature],
                    this._getVectorLayerStyle(defaultStyle)
                  )
                );
              } else if (geomType === 'TEXT') {
                // @ts-ignore
                var text = new L.supermap.labelThemeLayer(defaultStyle.text + '-text');

                text.style = {
                  fontSize: defaultStyle.font.split(' ')[0],
                  labelRect: true,
                  fontColor: defaultStyle.fillColor,
                  fill: true,
                  fillColor: defaultStyle.backgroundFill, // TODO labelStyle 未返回标签背景颜色 待确定；
                  stroke: false
                };
                text.themeField = 'text';
                feature.properties.text = defaultStyle.text;
                // @ts-ignore
                let geoTextFeature = new L.supermap.themeFeature(
                  [feature.geometry.coordinates[1], feature.geometry.coordinates[0], defaultStyle.text],
                  feature.properties
                );
                text.addFeatures([geoTextFeature]);
                resolve(text);
              } else {
                resolve(
                  L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                    ...this._getVectorLayerStyle(defaultStyle)
                  })
                );
              }
            }
          });
        });
      layerGroupPromises &&
        Promise.all(layerGroupPromises)
          .then(layerGroup => {
            layerGroup && resolve(L.layerGroup(layerGroup as L.Layer[]));
          })
          .catch(error => {
            console.error(error);
          });
    });
  }

  /**
  * @private
  * @function WebMapViewModel.prototype._createRankSymbolLayer
  * @description 添加等级符号图层。
  * @param layerInfo  某个图层的图层信息
  * @param {Array.<GeoJSON>} features - feature。
  */
  private _createRankSymbolLayer(layerInfo, features) {
    let fieldName = layerInfo.themeSetting.themeField;
    let style = layerInfo.style;
    let styleSource: any = this._createRankStyleSource(layerInfo, features, layerInfo.featureType);
    let styleGroups = styleSource.styleGroups;
    features = this._getFiterFeatures(layerInfo.filterCondition, features);
    let radiusList = [];
    features.forEach(row => {
      let target = parseFloat(row.properties[fieldName]);
      if (styleGroups) {
        for (let i = 0; i < styleGroups.length; i++) {
          if (styleGroups[i].start <= target && target < styleGroups[i].end) {
            let radius =
              style.type === 'SYMBOL_POINT' || style.type === 'IMAGE_POINT'
                ? style.type === 'SYMBOL_POINT'
                  ? styleGroups[i].radius * 2
                  : styleGroups[i].radius
                : styleGroups[i].radius;
            radiusList.push(radius);
          }
        }
      }
    }, this);
    if (style.type === 'SYMBOL_POINT') {
      return this._createSymbolLayer(layerInfo, features, radiusList);
    } else if (style.type === 'IMAGE_POINT' || style.type === 'SVG_POINT') {
      return this._createGraphicLayer(layerInfo, features, radiusList);
    } else {
      const layerGroup = [];
      features.forEach((feature, index) => {
        const newStyle = Object.assign({}, style, { radius: radiusList[index] });
        layerGroup.push(
          L.circleMarker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            this._getVectorLayerStyle(newStyle)
          )
        );
      });
      return L.layerGroup(layerGroup);
    }
  }

  private _createRankStyleSource(parameters, features, featureType) {
    let themeSetting = parameters.themeSetting,
      themeField = themeSetting.themeField;
    let styleGroups = this._getRankStyleGroup(themeField, features, parameters, featureType);
    // @ts-ignore
    return styleGroups ? { parameters, styleGroups } : false;
  }
  private _getRankStyleGroup(themeField, features, parameters, featureType) {
    // 找出所有的单值
    let values = [],
      segements = [],
      style = parameters.style,
      themeSetting = parameters.themeSetting,
      segmentMethod = themeSetting.segmentMethod,
      segmentCount = themeSetting.segmentCount,
      customSettings = themeSetting.customSettings,
      minR = parameters.themeSetting.minRadius,
      maxR = parameters.themeSetting.maxRadius;
    features.forEach(feature => {
      let properties = feature.properties,
        value = properties[themeField];
      // 过滤掉空值和非数值
      if (value == null || !isNumber(+value)) {
        return;
      }
      values.push(Number(value));
    });
    try {
      segements = SuperMap.ArrayStatistic.getArraySegments(values, segmentMethod, segmentCount);
    } catch (error) {
      console.error(error);
    }

    // 处理自定义 分段
    for (let i = 0; i < segmentCount; i++) {
      if (i in customSettings) {
        let startValue = customSettings[i]['segment']['start'],
          endValue = customSettings[i]['segment']['end'];
        startValue != null && (segements[i] = startValue);
        endValue != null && (segements[i + 1] = endValue);
      }
    }

    //生成styleGroup
    let styleGroup = [];
    if (segements && segements.length) {
      let len = segements.length,
        incrementR = (maxR - minR) / (len - 1), // 半径增量
        start,
        end,
        radius = Number(((maxR + minR) / 2).toFixed(2));
      for (let i = 0; i < len - 1; i++) {
        start = Number(segements[i].toFixed(2));
        end = Number(segements[i + 1].toFixed(2));
        // 这里特殊处理以下分段值相同的情况（即所有字段值相同）
        radius = start === end ? radius : minR + Math.round(incrementR * i);
        // 最后一个分段时将end+0.01，避免取不到最大值
        end = i === len - 2 ? end + 0.01 : end;
        // 处理自定义 半径
        radius = customSettings[i] && customSettings[i].radius ? customSettings[i].radius : radius;
        style.radius = radius;
        styleGroup.push({ radius, start, end, style });
      }
      return styleGroup;
    } else {
      return false;
    }
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._setFeatureInfo
   * @description 设置 feature 信息。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _setFeatureInfo(feature: any): any {
    let featureInfo;
    let info = feature.dv_v5_markerInfo;
    if (info && info.dataViz_title) {
      // 有featureInfo信息就不需要再添加
      featureInfo = info;
    } else {
      // featureInfo = this.getDefaultAttribute();
      return info;
    }
    let properties = feature.properties;
    for (let key in featureInfo) {
      if (properties[key]) {
        featureInfo[key] = properties[key];
        delete properties[key];
      }
    }
    return featureInfo;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._addLabelLayer
   * @description 添加标签图层。
   * @param layerInfo  某个图层的图层信息。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _addLabelLayer(layerInfo: any, features: any) {
    let { labelStyle, layerID, featureType } = layerInfo;
    // @ts-ignore
    var label = new L.supermap.labelThemeLayer(layerID + '-label');
    labelStyle.fontSize = 14;
    labelStyle.labelRect = true;
    labelStyle.fontColor = labelStyle.fill;
    labelStyle.fill = true;
    labelStyle.fillColor = '#FFFFFF'; // TODO labelStyle 未返回标签背景颜色 待确定；
    labelStyle.stroke = false;
    labelStyle.strokeColor = '#8B7B8B';
    label.style = labelStyle;
    label.themeField = labelStyle.labelField;

    let labelFeatures = this._convertLabelFeatures(label, features, layerInfo, featureType);
    label.addFeatures(labelFeatures);

    return label;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createHeatLayer
   * @description 添加热力图。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createHeatLayer(layerInfo: any, features: any): void {
    let { themeSetting, layerID } = layerInfo;

    let { colors, radius, customSettings, weight } = themeSetting;

    let heatColors = colors.slice();

    // 自定义颜色
    for (let i in customSettings) {
      heatColors[i] = customSettings[i];
    }

    let gradient = {};
    for (let i = 0, len = heatColors.length, index = 1; i < len; i++) {
      gradient[index / len] = heatColors[i];
      index++;
    }

    // @ts-ignore  TODO - 待确定是否使用 classic 接口
    let heatMapLayer = L.supermap.heatMapLayer(layerID, {
      colors: heatColors,
      map: this.map,
      radius: radius * 2, // blur TODO
      featureWeight: weight
    });

    // // @ts-ignore
    // let heatMapLayer = L.heatLayer(features, {
    //   radius: radius,
    //   minOpacity: opacity,
    //   gradient: gradient,
    //   blur: radius / 2,
    //   featureWeight: weight
    // }).addTo(this.map);

    heatMapLayer.addFeatures({
      type: 'FeatureCollection',
      features: features
    });

    return heatMapLayer;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createSymbolLayer
   * @description 添加 symbol 图层。
   * @param layerInfo  某个图层的图层信息。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createSymbolLayer(layerInfo: any, features: any, textSize?) {
    let { style } = layerInfo;

    let { fillColor, unicode } = style;

    let pointToLayer;

    if (unicode) {
      let symbolStyle = JSON.parse(JSON.stringify(style));
      symbolStyle.fontColor = fillColor;
      symbolStyle.label = unicode;
      symbolStyle.fontFamily = 'supermapol-icons'
      pointToLayer = (geojson, latlng) => {
        textSize && (symbolStyle.fontSize = textSize[geojson.id - 1 || geojson.properties.index] + '');
        // @ts-ignore
        return new L.supermap.unicodeMarker(latlng, symbolStyle);
      };
    }

    return pointToLayer && this._createGeojsonLayer(features, null, pointToLayer);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createGraphicLayer
   * @description 创建 Graphic 图层。
   * @param {Object} layerInfo - map 信息。
   * @param {Array} features - 属性 信息。
   */
  private _createGraphicLayer(layerInfo: any, features: any, textSize?): Promise<object> {
    return new Promise((resolve, reject) => {
      let { style } = layerInfo;
      let { type, imageInfo, radius, url } = style;
      let pointToLayer;
      if (type === 'IMAGE_POINT' && imageInfo.url) {
        let resolution = imageInfo.size.w / imageInfo.size.h;
        pointToLayer = (geojson, latlng) => {
          let iconSize = textSize && textSize[geojson.id - 1 || geojson.properties.index] * 2;
          return L.marker(latlng, {
            icon: L.icon({
              iconUrl: imageInfo.url,
              iconSize: textSize ? [iconSize, iconSize / resolution] : [radius * 2, (radius * 2) / resolution]
            })
          });
        };
      } else if (type === 'SVG_POINT') {
        if (!this._svgDiv) {
          this._svgDiv = document.createElement('div');
          document.body.appendChild(this._svgDiv);
        }
        this._getCanvasFromSVG(url, this._svgDiv, canvas => {
          resolve(this._getSvgLayer(canvas, style, features, textSize));
        });
      } else {
        pointToLayer = (geojson, latlng) => {
          return L.circleMarker(latlng, this._getVectorLayerStyle(style));
        };
      }
      pointToLayer && resolve(this._createGeojsonLayer(features, null, pointToLayer));
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createVectorLayer
   * @description 创建 Vector 图层。
   * @param {Object} layerInfo - map 信息。
   * @param {Array} features - 属性 信息。
   */
  private _createVectorLayer(layerInfo: any, features: any): void {
    let { style } = layerInfo;
    return this._createGeojsonLayer(features, this._getVectorLayerStyle(style));
  }

  private _createMigrationLayer(layerInfo, features) {
    // window['echarts'] = echarts;
    let properties = this._getFeatureProperties(features);
    let lineData = this._createLinesData(layerInfo, properties);
    let pointData = this._createPointsData(lineData, layerInfo, properties);
    let options = this._createOptions(layerInfo, lineData, pointData);
    // @ts-ignore
    let layer = L.supermap.echartsLayer(options);
    this.echartslayer.push(layer);
    return layer;
  }

  private _createGeojsonLayer(features, style?, pointToLayer?) {
    style = style || {};
    return L.geoJSON(
      {
        type: 'FeatureCollection',
        // @ts-ignore
        features: features
      },
      { pointToLayer, style}
    );
  }

  private _getVectorLayerStyle(style) {
    let { fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWidth, radius, lineDash } = style;
    let commonStyle = {
      color: strokeColor,
      weight: strokeWidth,
      opacity: strokeOpacity,
      fillColor,
      fillOpacity
    };
    let dashArray;
    if (lineDash) {
      dashArray = this._dashStyle(lineDash, strokeWidth);
    }
    radius && (commonStyle['radius'] = radius);
    lineDash && (commonStyle['dashArray'] = dashArray);
    return commonStyle;
  }

  private _addLayerSucceeded(sendMap = true) {
    if (sendMap) {
      this.layerAdded++;
      this._sendMapToUser(this.layerAdded, this.expectLayerLen);
    }
  }

  private _addLayerToMap(layer, type, layerName, visible, sendToMap = true) {
    if(visible === undefined || visible){
      this.map.addLayer(layer);
    }
    !this.layers[type] && (this.layers[type] = {});
    this.layers[type][layerName] = layer;
    this._addLayerSucceeded(sendToMap);
  }

  private _convertLabelFeatures(layer, features, layerInfo, featureType) {
    if (!features) {
      return [];
    }
    let { themeField, style } = layer;
    let labelFeatures = [];
    let layerStyle = layerInfo.style;
    features.forEach(feature => {
      let coordinate = this._getLabelLngLat(featureType, feature);
      this._setLabelOffset(featureType, layerStyle, style);
      let properties = feature.properties;
      // @ts-ignore
      let geoTextFeature = new L.supermap.themeFeature(
        [coordinate[1], coordinate[0], properties[themeField]],
        properties
      );
      labelFeatures.push(geoTextFeature);
    });
    return labelFeatures;
  }

  private _getLabelLngLat(featureType, feature) {
    let coordinate;
    let coordinates = feature.geometry.coordinates;
    if (featureType === 'POINT') {
      coordinate = coordinates;
    } else if (featureType === 'LINE') {
      let length = coordinates.length;
      coordinate = coordinates[Math.round(length / 2)];
    } else {
      coordinate = getCenter(feature).geometry.coordinates;
    }
    return coordinate;
  }

  private _setLabelOffset(featureType, layerStyle, style) {
    if (featureType === 'POINT') {
      var pointRadius = layerStyle.pointRadius || 0;
      var strokeWidth = layerStyle.strokeWidth || 0;
      var fontSize = parseInt(layerStyle.fontSize) || 0;
      style.labelXOffset = 0;
      style.labelYOffset = layerStyle.unicode ? 20 + fontSize : 25 + (pointRadius + strokeWidth);
    } else {
      return;
    }
  }

  private _getType(layer) {
    let type;
    let isHosted =
      (layer.dataSource && layer.dataSource.serverId) ||
      layer.layerType === 'MARKER' ||
      layer.layerType === 'HOSTED_TILE';
    let isTile =
      layer.layerType === 'SUPERMAP_REST' ||
      layer.layerType === 'TILE' ||
      layer.layerType === 'WMS' ||
      layer.layerType === 'WMTS';
    if (isHosted) {
      type = 'hosted';
    } else if (isTile) {
      type = 'tile';
    } else if (layer.dataSource && layer.dataSource.type === 'REST_DATA') {
      type = 'rest_data';
    } else if (layer.dataSource && layer.dataSource.type === 'REST_MAP' && layer.dataSource.url) {
      type = 'rest_map';
    } else if (layer.layerType === 'DATAFLOW_POINT_TRACK' || layer.layerType === 'DATAFLOW_HEAT') {
      type = 'dataflow';
    }
    return type;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getUniqueStyleGroup
   * @description 获取单值的目标字段与颜色的对应数组。
   * @param layerInfo  某个图层的图层信息
   * @param features   图层上的 feature
   */
  private _getUniqueStyleGroup(parameters: any, features: any): Array<{ color: string; value: string }> {
    // 找出所有的单值
    let featureType = parameters.featureType;
    let style = parameters.style;
    let themeSetting = parameters.themeSetting;
    let fieldName = themeSetting.themeField;
    let colors = themeSetting.colors;
    Object.keys(features[0].properties).forEach(key => {
      key.toLocaleUpperCase() === fieldName.toLocaleUpperCase() && (fieldName = key);
    });
    let names = [];
    let customSettings = themeSetting.customSettings;
    for (let i in features) {
      let properties = features[i].properties;
      let name = properties[fieldName];
      let isSaved = false;
      for (let j in names) {
        if (names[j] === name) {
          isSaved = true;
          break;
        }
      }
      if (!isSaved) {
        names.push(name || '0');
      }
    }

    // 获取一定量的颜色
    let curentColors = colors;
    curentColors = SuperMap.ColorsPickerUtil.getGradientColors(curentColors, names.length);

    // 生成styleGroup
    let styleGroup = [];
    names.forEach((name, index) => {
      let color = curentColors[index];
      if (name in customSettings) {
        color = customSettings[name];
      }
      if (featureType === 'LINE') {
        style.strokeColor = color;
      } else {
        style.fillColor = color;
      }
      styleGroup.push({
        style: { ...style },
        value: name
      });
    }, this);

    return styleGroup;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getRangeStyleGroup
   * @description 获取分段样式。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _getRangeStyleGroup(layerInfo: any, features: any): Array<any> | void {
    // 找出分段值
    let featureType = layerInfo.featureType;
    let style = layerInfo.style;
    let values = [];
    let attributes;

    let themeSetting = layerInfo.themeSetting;
    let customSettings = themeSetting.customSettings;
    let fieldName = themeSetting.themeField;
    let segmentCount = themeSetting.segmentCount;

    features.forEach(feature => {
      attributes = feature.properties || feature.get('Properties');
      if (attributes) {
        // 过滤掉非数值的数据
        attributes[fieldName] && isNumber(+attributes[fieldName]) && values.push(parseFloat(attributes[fieldName]));
      } else if (feature.get(fieldName) && isNumber(+feature.get(fieldName))) {
        feature.get(fieldName) && values.push(parseFloat(feature.get(fieldName)));
      }
    }, this);

    let segements = SuperMap.ArrayStatistic.getArraySegments(values, themeSetting.segmentMethod, segmentCount);
    if (segements) {
      let itemNum = segmentCount;
      if (attributes && segements[0] === segements[attributes.length - 1]) {
        itemNum = 1;
        segements.length = 2;
      }

      // 保留两位有效数
      for (let i = 0; i < segements.length; i++) {
        let value = segements[i];
        value = i === 0 ? Math.floor(value * 100) / 100 : Math.ceil(value * 100) / 100 + 0.1; // 加0.1 解决最大值没有样式问题
        segements[i] = Number(value.toFixed(2));
      }

      // 获取一定量的颜色
      let curentColors = themeSetting.colors;
      // curentColors = SuperMap.ColorsPickerUtil.getGradientColors(curentColors, itemNum, 'RANGE');

      for (let index = 0; index < itemNum; index++) {
        if (index in customSettings) {
          if (customSettings[index]['segment']['start']) {
            segements[index] = customSettings[index]['segment']['start'];
          }
          if (customSettings[index]['segment']['end']) {
            segements[index + 1] = customSettings[index]['segment']['end'];
          }
        }
      }
      // 生成styleGroup
      let styleGroups = [];
      for (let i = 0; i < itemNum; i++) {
        let color = curentColors[i];
        if (i in customSettings) {
          if (customSettings[i].color) {
            color = customSettings[i].color;
          }
        }
        if (featureType === 'LINE') {
          style.strokeColor = color;
        } else {
          style.fillColor = color;
        }

        let start = segements[i];
        let end = segements[i + 1];
        let styleObj = JSON.parse(JSON.stringify(style));
        styleGroups.push({
          style: styleObj,
          color: color,
          start: start,
          end: end
        });
      }
      return styleGroups;
    }
  }

  private _getFeaturesFromHosted({ layer, index, len, _taskID }) {
    //数据存储到iportal上了
    let { dataSource, layerType } = layer;
    let serverId = dataSource ? dataSource.serverId : layer.serverId;
    if (!serverId) {
      this._addLayer(layer, null, index);
      return;
    }

    let getDataFromIportal =
      layerType === 'MARKER' || (dataSource && (!dataSource.accessType || dataSource.accessType === 'DIRECT'));
    if (getDataFromIportal) {
      this._getDataFromIportal({ layer, serverId, _taskID, len, index });
    } else {
      this._getDataFromHosted({ layer, serverId, len, index });
    }
  }

  private _getDataFromHosted({ layer, serverId, len, index }) {
    //关系型文件
    let isMapService = layer.layerType === 'HOSTED_TILE';
    this._checkUploadToRelationship(serverId)
      .then(result => {
        if (result && result.length > 0) {
          let datasetName = result[0].name,
            featureType = result[0].type.toUpperCase();
          this._getDataService(serverId, datasetName).then(data => {
            let dataItemServices = data.dataItemServices;
            if (dataItemServices.length === 0) {
              throw new Error();
            }
            if (isMapService) {
              let dataService = dataItemServices.filter(info => {
                return info && info.serviceType === 'RESTDATA';
              })[0];
              this._isMvt(dataService.address, datasetName)
                .then(info => {
                  this._getServiceInfoFromLayer(index, len, layer, dataItemServices, datasetName, featureType, info);
                })
                .catch(() => {
                  //判断失败就走之前逻辑，>数据量用tile
                  this._getServiceInfoFromLayer(index, len, layer, dataItemServices, datasetName, featureType);
                });
            } else {
              this._getServiceInfoFromLayer(index, len, layer, dataItemServices, datasetName, featureType);
            }
          });
        } else {
          throw new Error();
        }
      })
      .catch(error => {
        this._addLayerSucceeded();
        this.fire('getlayerdatasourcefailed', {
          error: error,
          layer: layer,
          map: this.map
        });
      });
  }

  private _getFeaturesFromRestData({ layer, index, len }) {
    //从restData获取数据
    let features;
    let dataSource = layer.dataSource;
    this._getFeatureBySQL(
      dataSource.url,
      [dataSource.dataSourseName || layer.name],
      result => {
        features = this._parseGeoJsonData2Feature({
          allDatas: {
            features: result.result.features.features
          },
          fileCode: layer.projection,
          featureProjection: this.baseProjection
        });

        this._addLayer(layer, features, index);
      },
      err => {
        this._addLayerSucceeded();
        this.fire('getlayerdatasourcefailed', {
          error: err,
          layer: layer,
          map: this.map
        });
      }
    );
  }

  private _getFeaturesFromRestMap({ layer, index, len }) {
    this._queryFeatureBySQL(
      layer.dataSource.url,
      layer.dataSource.layerName,
      result => {
        let recordsets = result && result.result.recordsets;
        let recordset = recordsets && recordsets[0];
        let attributes = recordset.fields;
        if (recordset && attributes) {
          let fileterAttrs: string[] = [];
          for (let i in attributes) {
            let value = attributes[i];
            if (value.indexOf('Sm') !== 0 || value === 'SmID') {
              fileterAttrs.push(value);
            }
          }
          this._getFeatures(
            fileterAttrs,
            layer,
            features => {
              this._addLayer(layer, features, index);
            },
            err => {
              this._addLayerSucceeded();
              this.fire('getlayerdatasourcefailed', {
                error: err,
                layer: layer,
                map: this.map
              });
            }
          );
        }
      },
      err => {
        this._addLayerSucceeded();
        this.fire('getlayerdatasourcefailed', {
          error: err,
          layer: layer,
          map: this.map
        });
      },
      'smid=1'
    );
  }

  private _getFeaturesFromDataflow({ layer, index, len }) {
    this._getDataflowInfo(
      layer,
      () => {
        this._addLayer(layer, null, index);
      },
      e => {
        this._addLayerSucceeded();
        // TODO  fire faild
      }
    );
  }

  private _getDataFromIportal({ layer, serverId, _taskID, len, index }) {
    let features;
    //原来二进制文件
    let url = `${this.serverUrl}web/datas/${serverId}/content.json?pageSize=9999999&currentPage=1`;
    if (this.accessToken) {
      url = `${url}&${this.accessKey}=${this.accessToken}`;
    }
    SuperMap.FetchRequest.get(url, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (_taskID !== this._taskID) {
          return;
        }
        if (data.succeed === false) {
          //请求失败
          throw new Error(data.error);
        }
        if (data && data.type) {
          if (data.type === 'JSON' || data.type === 'GEOJSON') {
            data.content = JSON.parse(data.content.trim());
            features = this._formatGeoJSON(data.content);
          } else if (data.type === 'EXCEL' || data.type === 'CSV') {
            features = this._excelData2Feature(data.content);
          }
          this._addLayer(layer, features, index);
        }
      })
      .catch(error => {
        this._addLayerSucceeded();
        this.fire('getlayerdatasourcefailed', {
          error: error,
          layer: layer,
          map: this.map
        });
      });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._sendMapToUser
   * @description 返回最终的 map 对象给用户，供他们操作使用。
   * @param count
   * @param layersLen
   */
  private _sendMapToUser(count: number, layersLen: number): void {
    if (count === layersLen) {
      /**
       * @event WebMapViewModel#addlayerssucceeded
       * @description 添加图层成功。
       * @property {L.Map} map - Leaflet Map 对象。
       * @property {Object} mapparams - 地图信息。
       * @property {string} mapParams.title - 地图标题。
       * @property {string} mapParams.description - 地图描述。
       * @property {Array.<Object>} layers - 地图上所有的图层对象。
       */

      // 图层顺序 -------------------------------TODO
      // for (let index = this._layers.length - 2; index > -1; index--) {
      //   const targetlayerId = this._layers[index].layerID;
      //   const beforLayerId = this._layers[index + 1].layerID;
      //   this.map.moveLayer(targetlayerId, beforLayerId);
      // }

      this.fire('addlayerssucceeded', {
        map: this.map,
        mapparams: this.mapParams,
        layers: this._layers
      });
    }
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getFiterFeatures
   * @description 通过过滤条件查询满足的 feature。
   * @param {String} filterCondition - 过滤条件。
   * @param {array} allFeatures - 图层上的 feature 集合
   */
  private _getFiterFeatures(filterCondition: string, allFeatures): any {
    if (!filterCondition) {
      return allFeatures;
    }
    let condition = this._replaceFilterCharacter(filterCondition);
    let sql = 'select * from json where (' + condition + ')';
    let filterFeatures = [];
    for (let i = 0; i < allFeatures.length; i++) {
      let feature = allFeatures[i];
      let filterResult: any;
      try {
        filterResult = window['jsonsql'].query(sql, {
          properties: feature.properties
        });
      } catch (err) {
        // 必须把要过滤得内容封装成一个对象,主要是处理jsonsql(line : 62)中由于with语句遍历对象造成的问题
        continue;
      }
      if (filterResult && filterResult.length > 0) {
        // afterFilterFeatureIdx.push(i);
        filterFeatures.push(feature);
      }
    }
    return filterFeatures;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._checkUploadToRelationship
   * @description 检查是否上传到关系型
   * @param {String} fileId - 文件的id
   *  @returns {Promise<T | never>} 关系型文件一些参数
   */
  _checkUploadToRelationship(fileId) {
    return SuperMap.FetchRequest.get(`${this.serverUrl}web/datas/${fileId}/datasets.json`, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(result => {
        return result;
      });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getDataService
   * @description 获取上传的数据信息
   * @param {String} fileId - 文件id
   * @param {String} datasetName 数据服务的数据集名称
   *  @returns {Promise<T | never>} 数据的信息
   */
  private _getDataService(fileId, datasetName) {
    return SuperMap.FetchRequest.get(`${this.serverUrl}web/datas/${fileId}.json`, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(result => {
        result.fileId = fileId;
        result.datasetName = datasetName;
        return result;
      });
  }

  private _isMvt(serviceUrl, datasetName) {
    return this._getDatasetsInfo(serviceUrl, datasetName).then(info => {
      //判断是否和底图坐标系一直
      if (info.epsgCode == this.baseProjection.split('EPSG:')[1]) {
        return SuperMap.FetchRequest.get(`${info.url}/tilefeature.mvt`)
          .then(function (response) {
            return response.json();
          })
          .then(function (result) {
            info.isMvt = result.error && result.error.code === 400;
            return info;
          })
          .catch(() => {
            return info;
          });
      }
      return info;
    });
  }

  private _getServiceInfoFromLayer(layerIndex, len, layer, dataItemServices, datasetName, featureType, info?: any) {
    let isMapService = info ? !info.isMvt : layer.layerType === 'HOSTED_TILE',
      isAdded = false;
    dataItemServices.forEach((service, index) => {
      if (isAdded) {
        return;
      }
      //有服务了，就不需要循环
      if (service && isMapService && service.serviceType === 'RESTMAP') {
        isAdded = true;
        //地图服务,判断使用mvt还是tile
        this._getTileLayerInfo(service.address).then(restMaps => {
          restMaps.forEach(restMapInfo => {
            let bounds = restMapInfo.bounds;
            layer.layerType = 'TILE';
            layer.orginEpsgCode = this.baseProjection;
            layer.units = restMapInfo.coordUnit && restMapInfo.coordUnit.toLowerCase();
            layer.extent = [bounds.left, bounds.bottom, bounds.right, bounds.top];
            layer.visibleScales = restMapInfo.visibleScales;
            layer.url = restMapInfo.url;
            layer.sourceType = 'TILE';
            this._createBaseLayer(layer);
          });
        });
      } // TODO 对接 MVT
      else if (service && !isMapService && service.serviceType === 'RESTDATA') {
        if (info && info.isMvt) {
          // this._addVectorLayer(info, layer, featureType);
          this._addLayerSucceeded();
        } else {
          //数据服务
          isAdded = true;
          //关系型文件发布的数据服务
          this._getDatasources(service.address).then(datasourceName => {
            layer.dataSource.dataSourceName = datasourceName + ':' + datasetName;
            layer.dataSource.url = `${service.address}/data`;
            this._getFeatureBySQL(
              layer.dataSource.url,
              [layer.dataSource.dataSourceName || layer.name],
              result => {
                let features = this._parseGeoJsonData2Feature({
                  allDatas: {
                    features: result.result.features.features
                  },
                  fileCode: layer.projection,
                  featureProjection: this.baseProjection
                });
                this._addLayer(layer, features, layerIndex);
              },
              err => {
                this._addLayerSucceeded();
                this.fire('getlayerdatasourcefailed', {
                  error: err,
                  layer: layer,
                  map: this.map
                });
              }
            );
          });
        }
      }
    }, this);
    if (!isAdded) {
      //循环完成了，也没有找到合适的服务。有可能服务被删除
      this._addLayerSucceeded();
      this.fire('getlayerdatasourcefailed', {
        error: null,
        layer: layer,
        map: this.map
      });
    }
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getFeatureBySQL
   * @description 通过 sql 方式查询数据。
   */
  private _getFeatureBySQL(
    url: string,
    datasetNames: Array<string>,
    processCompleted: Function,
    processFaild: Function
  ): void {
    let getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;
    getFeatureParam = new SuperMap.FilterParameter({
      name: datasetNames.join().replace(':', '@'),
      attributeFilter: 'SMID > 0'
    });
    getFeatureBySQLParams = new SuperMap.GetFeaturesBySQLParameters({
      queryParameter: getFeatureParam,
      datasetNames: datasetNames,
      fromIndex: 0,
      toIndex: -1,
      maxFeatures: -1,
      returnContent: true
    });
    let options = {
      eventListeners: {
        processCompleted: getFeaturesEventArgs => {
          processCompleted && processCompleted(getFeaturesEventArgs);
        },
        processFailed: e => {
          processFaild && processFaild(e);
        }
      }
    };
    getFeatureBySQLService = new SuperMap.GetFeaturesBySQLService(url, options);
    getFeatureBySQLService.processAsync(getFeatureBySQLParams);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._parseGeoJsonData2Feature
   * @description 将从restData地址上获取的json转换成feature（从iserver中获取的json转换成feature）
   * @param {object} metaData - json内容
   */
  private _parseGeoJsonData2Feature(metaData: any): any {
    let allFeatures = metaData.allDatas.features;
    let features = [];
    for (let i = 0, len = allFeatures.length; i < len; i++) {
      let feature = allFeatures[i];
      let coordinate = feature.geometry.coordinates;
      if (allFeatures[i].geometry.type === 'Point') {
        // 标注图层 还没有属性值时候不加
        if (allFeatures[i].properties) {
          allFeatures[i].properties.lon = coordinate[0];
          allFeatures[i].properties.lat = coordinate[1];
        }
      }
      feature.properties['index'] = i + '';
      features.push(feature);
    }
    return features;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._queryFeatureBySQL
   * @description 通过 sql 方式查询数据。
   */
  private _queryFeatureBySQL(
    url: string,
    layerName: string,
    processCompleted: Function,
    processFaild: Function,
    attributeFilter?: string,
    fields?: Array<string>,
    epsgCode?: string,
    startRecord?,
    recordLength?,
    onlyAttribute?
  ): void {
    let queryParam = new SuperMap.FilterParameter({
      name: layerName,
      attributeFilter: attributeFilter
    });
    if (fields) {
      queryParam.fields = fields;
    }
    let params: any = {
      queryParams: [queryParam]
    };
    if (onlyAttribute) {
      params.queryOption = SuperMap.QueryOption.ATTRIBUTE;
    }
    startRecord && (params.startRecord = startRecord);
    recordLength && (params.expectCount = recordLength);
    if (epsgCode) {
      params.prjCoordSys = {
        epsgCode: epsgCode
      };
    }
    let queryBySQLParams = new SuperMap.QueryBySQLParameters(params);
    // @ts-ignore
    let queryBySQLService = L.supermap.queryService(url);
    queryBySQLService.queryBySQL(queryBySQLParams, data => {
      data.type === 'processCompleted' ? processCompleted(data) : processFaild(data);
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getFeatures
   */
  private _getFeatures(fields: string[], layerInfo: any, resolve: Function, reject: Function): void {
    let source = layerInfo.dataSource;
    // 示例数据
    let fileCode = layerInfo.projection;
    this._queryFeatureBySQL(
      source.url,
      source.layerName,
      result => {
        let recordsets = result.result.recordsets[0];
        let features = recordsets.features.features;

        let featuresObj = this._parseGeoJsonData2Feature({
          allDatas: { features },
          fileCode: fileCode,
          featureProjection: this.baseProjection
        });
        resolve(featuresObj);
      },
      err => {
        reject(err);
      },
      null,
      fields
    );
  }

  private _getDataflowInfo(layerInfo, success, faild?) {
    let url = layerInfo.url,
      token;
    let requestUrl = `${url}.json`;
    if (layerInfo.credential && layerInfo.credential.token) {
      token = layerInfo.credential.token;
      requestUrl += `?token=${token}`;
    }
    SuperMap.FetchRequest.get(requestUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result && result.featureMetaData) {
          layerInfo.featureType = result.featureMetaData.featureType.toUpperCase();
          layerInfo.dataSource = { dataTypes: {} };
          if (result.featureMetaData.fieldInfos && result.featureMetaData.fieldInfos.length > 0) {
            result.featureMetaData.fieldInfos.forEach(function (data) {
              let name = data.name.trim();
              if (data.type === 'TEXT') {
                layerInfo.dataSource.dataTypes[name] = 'STRING';
              } else if (['DOUBLE', 'INT', 'FLOAT', 'LONG', 'SHORT'].includes(data.type)) {
                layerInfo.dataSource.dataTypes[name] = 'NUMBER';
              } else {
                layerInfo.dataSource.dataTypes[name] = 'UNKNOWN';
              }
            });
          }
          layerInfo.wsUrl = result.urls[0].url;
          layerInfo.name = result.urls[0].url.split('iserver/services/')[1].split('/dataflow')[0];
          success();
        } else {
          //失败也要到成功会调函数中，否则不会继续执行
          faild();
        }
      })
      .catch(function () {
        faild();
      });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._formatGeoJSON
   * @description 格式 GeoJSON。
   * @param {GeoJSON} data - GeoJSON 数据。
   */
  private _formatGeoJSON(data): any {
    let features = data.features;
    features.forEach((row, index) => {
      row.properties['index'] = index;
    });
    return features;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._excelData2Feature将
   * @description csv 和 xls 文件内容转换成 geojson
   * @param content  文件内容
   * @param layerInfo  图层信息
   * @returns {Array}  feature的数组集合
   */
  private _excelData2Feature(dataContent: any): any {
    let fieldCaptions = dataContent.colTitles;
    // 位置属性处理
    let xfieldIndex = -1;
    let yfieldIndex = -1;
    for (let i = 0, len = fieldCaptions.length; i < len; i++) {
      if (isXField(fieldCaptions[i])) {
        xfieldIndex = i;
      }
      if (isYField(fieldCaptions[i])) {
        yfieldIndex = i;
      }
    }

    // feature 构建后期支持坐标系 4326/3857
    let features = [];

    for (let i = 0, len = dataContent.rows.length; i < len; i++) {
      let row = dataContent.rows[i];

      let x = Number(row[xfieldIndex]);
      let y = Number(row[yfieldIndex]);

      // 属性信息
      let attributes = {};
      for (let index in dataContent.colTitles) {
        let key = dataContent.colTitles[index];
        attributes[key] = dataContent.rows[i][index];
      }
      attributes['index'] = i + '';
      // 目前csv 只支持处理点，所以先生成点类型的 geojson
      let feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [x, y]
        },
        properties: attributes
      };
      features.push(feature);
    }
    return features;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._replaceFilterCharacter
   * @description 获取过滤字符串。
   * @param {String} filterString - 过滤条件。
   */
  private _replaceFilterCharacter(filterString: string): string {
    filterString = filterString
      .replace(/=/g, '==')
      .replace(/AND|and/g, '&&')
      .replace(/or|OR/g, '||')
      .replace(/<==/g, '<=')
      .replace(/>==/g, '>=');
    return filterString;
  }

  _getDatasetsInfo(serviceUrl, datasetName) {
    return this._getDatasources(serviceUrl).then(datasourceName => {
      //判断mvt服务是否可用
      let url = `${serviceUrl}/data/datasources/${datasourceName}/datasets/${datasetName}`;
      return SuperMap.FetchRequest.get(url)
        .then(response => {
          return response.json();
        })
        .then(datasetsInfo => {
          return {
            epsgCode: datasetsInfo.datasetInfo.prjCoordSys.epsgCode,
            bounds: datasetsInfo.datasetInfo.bounds,
            datasourceName,
            datasetName,
            url //返回的是原始url，没有代理。因为用于请求mvt
          };
        });
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getDatasources
   * @description 获取关系型文件发布的数据服务中数据源的名称
   * @param {String} url - 获取数据源信息的url
   *  @returns {Promise<T | never>} 数据源名称
   */
  _getDatasources(url) {
    return SuperMap.FetchRequest.get(`${url}/data/datasources.json`)
      .then(response => {
        return response.json();
      })
      .then(datasource => {
        let datasourceNames = datasource.datasourceNames;
        return datasourceNames[0];
      });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getTileLayerInfo
   * @description 获取地图服务的信息
   * @param {String} url 地图服务的url（没有地图名字）
   * @returns {Promise<T | never>} 地图服务信息
   */
  _getTileLayerInfo(url) {
    let proxyUrl = this.serverUrl + 'apps/viewer/getUrlResource.json?url=';
    let requestUrl = proxyUrl + encodeURIComponent(url);
    let epsgCode = this.baseProjection.split('EPSG:')[1];
    return SuperMap.FetchRequest.get(`${requestUrl}/maps.json`, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(mapInfo => {
        let promises = [];
        if (mapInfo) {
          mapInfo.forEach(info => {
            let promise = SuperMap.FetchRequest.get(
              `${proxyUrl}${info.path}.json?prjCoordSys=${JSON.stringify({ epsgCode: epsgCode })}`,
              null,
              {
                withCredentials: this.withCredentials
              }
            )
              .then(response => {
                return response.json();
              })
              .then(restMapInfo => {
                restMapInfo.url = info.path;
                return restMapInfo;
              });
            promises.push(promise);
          });
        }
        return Promise.all(promises).then(allRestMaps => {
          return allRestMaps;
        });
      });
  }

  /**
   * @private
   * @description 将SVG转换成Canvas
   * @param svgUrl
   * @param divDom
   * @param callBack
   */
  private _getCanvasFromSVG(svgUrl: string, divDom: HTMLElement, callBack: Function): void {
    // 一个图层对应一个canvas
    let canvas = document.createElement('canvas');
    canvas.id = `dataviz-canvas-${new Date()}`;
    canvas.style.display = 'none';
    canvas.getContext('2d').fillStyle = 'red';
    divDom.appendChild(canvas);
    let canvgs = window.canvg ? window.canvg : canvg;
    canvgs(canvas.id, svgUrl, {
      ignoreMouse: true,
      ignoreAnimation: true,
      renderCallback: () => {
        if (canvas.width > 300 || canvas.height > 300) {
          return;
        }
        callBack(canvas);
      },
      forceRedraw: () => {
        return false;
      }
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype.._dashStyle
   * @description 符号样式。
   * @param {Object} style - 样式参数。
   * @param {number} widthFactor - 宽度系数。
   */
  private _dashStyle(str, strokeWidth) {
    if (!str) {
      return [];
    }
    var w = strokeWidth;
    switch (str) {
      case 'solid':
        return [];
      case 'dot':
        return `1,${4 * w}`;
      case 'dash':
        return `${4 * w},${4 * w}`;
      case 'dashdot':
        return `${4 * w},${4 * w},${1 * w},${4 * w}`;
      case 'longdash':
        return `${8 * w},${4 * w}`;
      case 'longdashdot':
        return `${8 * w},${4 * w},1,${4 * w}`;
      default:
        if (!str) {
          return [];
        }
        if (SuperMap.Util.isArray(str)) {
          return str;
        }
        str = SuperMap.String.trim(str).replace(/\s+/g, ',');
        return str;
    }
  }

  private _getFeatureProperties(features) {
    let properties = [];
    if (features && features.length) {
      features.forEach(feature => {
        let property = feature.properties;
        property && properties.push(property);
      });
    }
    return properties;
  }

  private _createLinesData(layerInfo, properties) {
    let data = [];
    if (properties && properties.length) {
      // 重新获取数据
      let from = layerInfo.from,
        to = layerInfo.to,
        fromCoord,
        toCoord;
      if (from.type === 'XY_FIELD' && from['xField'] && from['yField'] && to['xField'] && to['yField']) {
        properties.forEach(property => {
          let fromX = property[from['xField']],
            fromY = property[from['yField']],
            toX = property[to['xField']],
            toY = property[to['yField']];
          if (!fromX || !fromY || !toX || !toY) {
            return;
          }

          fromCoord = [property[from['xField']], property[from['yField']]];
          toCoord = [property[to['xField']], property[to['yField']]];
          data.push({
            coords: [fromCoord, toCoord]
          });
        });
      } else if (from.type === 'PLACE_FIELD' && from['field'] && to['field']) {
        const centerDatas = provincialCenterData.concat(municipalCenterData);

        properties.forEach(property => {
          let fromField = property[from['field']],
            toField = property[to['field']];
          fromCoord = centerDatas.find(item => {
            return this.isMatchAdministrativeName(item.name, fromField);
          });
          toCoord = centerDatas.find(item => {
            return this.isMatchAdministrativeName(item.name, toField);
          });
          if (!fromCoord || !toCoord) {
            return;
          }
          data.push({
            coords: [fromCoord.coord, toCoord.coord]
          });
        });
      }
    }
    return data;
  }

  private _createPointsData(lineData, layerInfo, properties) {
    let data = [],
      labelSetting = layerInfo.labelSetting;
    // 标签隐藏则直接返回
    if (!labelSetting.show || !lineData.length) {
      return data;
    }
    let fromData = [],
      toData = [];
    lineData.forEach((item, idx) => {
      let coords = item.coords,
        fromCoord = coords[0],
        toCoord = coords[1],
        fromProperty = properties[idx][labelSetting.from],
        toProperty = properties[idx][labelSetting.to];
      // 起始字段去重
      let f = fromData.find(d => {
        return d.value[0] === fromCoord[0] && d.value[1] === fromCoord[1];
      });
      !f &&
        fromData.push({
          name: fromProperty,
          value: fromCoord
        });
      // 终点字段去重
      let t = toData.find(d => {
        return d.value[0] === toCoord[0] && d.value[1] === toCoord[1];
      });
      !t &&
        toData.push({
          name: toProperty,
          value: toCoord
        });
    });
    data = fromData.concat(toData);
    return data;
  }

  private _createOptions(layerInfo, lineData, pointData) {
    let series;
    let lineSeries = this._createLineSeries(layerInfo, lineData);
    if (pointData && pointData.length) {
      let pointSeries: any = this._createPointSeries(layerInfo, pointData);
      series = lineSeries.concat(pointSeries);
    } else {
      series = lineSeries.slice();
    }
    return { series };
  }

  private _createLineSeries(layerInfo, lineData) {
    let lineSetting = layerInfo.lineSetting;
    let animationSetting = layerInfo.animationSetting;
    let linesSeries = [
      // 轨迹线样式
      {
        name: 'line-series',
        coordinateSystem: 'leaflet',
        type: 'lines',
        zlevel: 1,
        effect: {
          show: animationSetting.show,
          constantSpeed: animationSetting.constantSpeed,
          trailLength: 0,
          symbol: animationSetting.symbol,
          symbolSize: animationSetting.symbolSize
        },
        lineStyle: {
          normal: {
            color: lineSetting.color,
            type: lineSetting.type,
            width: lineSetting.width,
            opacity: lineSetting.opacity,
            curveness: lineSetting.curveness
          }
        },
        data: lineData
      }
    ];

    if (lineData.length >= MAX_MIGRATION_ANIMATION_COUNT) {
      // @ts-ignore
      linesSeries[0].large = true;
      // @ts-ignore
      linesSeries[0].largeThreshold = 100;
      // @ts-ignore
      linesSeries[0].blendMode = 'lighter';
    }

    return linesSeries;
  }
  private _createPointSeries(layerInfo, pointData) {
    let lineSetting = layerInfo.lineSetting;
    let animationSetting = layerInfo.animationSetting;
    let labelSetting = layerInfo.labelSetting;
    let pointSeries = [
      {
        name: 'point-series',
        coordinateSystem: 'leaflet',
        zlevel: 2,
        label: {
          normal: {
            show: labelSetting.show,
            position: 'right',
            formatter: '{b}',
            color: labelSetting.color,
            fontFamily: labelSetting.fontFamily
          }
        },
        itemStyle: {
          normal: {
            color: lineSetting.color || labelSetting.color
          }
        },
        data: pointData
      }
    ];

    if (animationSetting.show) {
      // 开启动画
      // @ts-ignore
      pointSeries[0].type = 'effectScatter';
      // @ts-ignore
      pointSeries[0].rippleEffect = {
        brushType: 'stroke'
      };
    } else {
      // 关闭动画
      // @ts-ignore
      pointSeries[0].type = 'scatter';
    }

    return pointSeries;
  }
  isMatchAdministrativeName(featureName, fieldName) {
    let isString = typeof fieldName === 'string' && fieldName.constructor === String;
    if (isString) {
      let shortName = featureName.substr(0, 2);
      // 张家口市和张家界市 特殊处理
      if (shortName === '张家') {
        shortName = featureName.substr(0, 3);
      }
      return !!fieldName.match(new RegExp(shortName));
    }
    return false;
  }
  _transformFeatures(features) {
    let crs = this.crs || L.CRS.EPSG3857;
    features &&
      features.forEach((feature, index) => {
        let geometryType = feature.geometry.type;
        let coordinates = feature.geometry.coordinates;
        if (geometryType === 'LineString') {
          coordinates.forEach((coordinate, index) => {
            coordinate = this._latlngToCoordinate(crs.unproject(L.point(coordinate[0], coordinate[1])));
            coordinates[index] = coordinate;
          }, this);
        } else if (geometryType === 'Point') {
          coordinates = this._latlngToCoordinate(crs.unproject(L.point(coordinates[0], coordinates[1])));
          feature.geometry.coordinates = coordinates;
        } else if (geometryType === 'MultiPolygon' || geometryType === 'Polygon') {
          coordinates.forEach((coordinate, index) => {
            let coords = geometryType === 'MultiPolygon' ? coordinate[0] : coordinate;
            coords.forEach((latlng, i) => {
              latlng = this._latlngToCoordinate(crs.unproject(L.point(latlng[0], latlng[1])));
              coords[i] = latlng;
            });
            coordinates[index] = coordinate;
          });
        }
        features[index] = feature;
      }, this);
  }

  _latlngToCoordinate(latlng) {
    if (!latlng) {
      return null;
    }
    return [latlng.lng, latlng.lat]
  }

  _getSvgLayer(canvas, style, features, textSize?) {
    let { radius, fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWidth } = style;
    let context = canvas.getContext('2d');

    if (fillColor) {
      context.fillStyle = getColorWithOpacity(fillColor, fillOpacity);
      context.fill();
    }

    if (strokeColor || strokeWidth) {
      context.strokeStyle = getColorWithOpacity(strokeColor, strokeOpacity);
      context.lineWidth = strokeWidth;
      context.stroke();
    }

    let imgUrl = canvas.toDataURL('img/png');
    let resolution = canvas.width / canvas.height;
    let svgPointToLayer = (geojson, latlng) => {
      let iconSize = textSize && textSize[geojson.id - 1 || geojson.properties.index];
      return L.marker(latlng, {
        icon: L.icon({
          iconUrl: imgUrl,
          iconSize: textSize ? [iconSize, iconSize / resolution] : [radius, radius / resolution]
        }),
      });
    };
    let svgPointLayer = this._createGeojsonLayer(features, null, svgPointToLayer);
    return svgPointLayer;
  }

  _createThemeLayer(type, layerInfo, features) {
    let { filterCondition, style, themeSetting, featureType, layerID } = layerInfo;
    let layerStyle = JSON.parse(JSON.stringify(style));
    featureType === 'POINT' && (layerStyle.pointRadius = style.radius);
    delete layerStyle.radius;

    if (featureType === 'LINE') {
      layerStyle.fill = false;
      layerStyle.strokeDashstyle = style.lineDash; // TODO lineDash 样式错误
      delete layerStyle.lineDash;
    }

    let styleGroup;
    if (type === 'unique') {
      styleGroup = this._getUniqueStyleGroup(layerInfo, features);
    } else if (type === 'range') {
      styleGroup = this._getRangeStyleGroup(layerInfo, features);
    }

    filterCondition && (features = this._getFiterFeatures(filterCondition, features));

    let themeField = themeSetting.themeField;
    Object.keys(features[0].properties).forEach(key => {
      key.toLocaleUpperCase() === themeField.toLocaleUpperCase() && (themeField = key);
    });
    // @ts-ignore
    let layer = L.supermap[`${type}ThemeLayer`](layerID);

    layerStyle.stroke = true;
    layer.style = layerStyle;
    layer.themeField = themeField;
    layer.styleGroups = styleGroup;
    layer.addFeatures({
      type: 'FeatureCollection',
      features: features
    });

    return layer;
  }
}
