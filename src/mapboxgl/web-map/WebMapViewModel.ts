/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from './SourceListModel';
import { handleMultyPolygon } from '../_utils/geometry-util';
import { isXField, isYField } from '../../common/_utils/util';
import '../../../static/libs/iclient-mapboxgl/iclient10-mapboxgl.min';
import '../../../static/libs/geostats/geostats';
import '../../../static/libs/json-sql/jsonsql';
import * as convert from 'xml-js';
import canvg from 'canvg';
import echarts from 'echarts';
import EchartsLayer from '../../../static/libs/echarts-layer/EchartsLayer';
import provincialCenterData from './config/ProvinceCenter.json'; // eslint-disable-line import/extensions
import municipalCenterData from './config/MunicipalCenter.json'; // eslint-disable-line import/extensions
import UniqueId from 'lodash.uniqueid';
import cloneDeep from 'lodash.clonedeep';
import { geti18n } from '../../common/_lang';

const MB_SCALEDENOMINATOR_3857 = [
  '559082264.0287178',
  '279541132.0143589',
  '139770566.0071794',
  '69885283.00358972',
  '34942641.50179486',
  '17471320.75089743',
  '8735660.375448715',
  '4367830.1877224357',
  '2183915.093862179',
  '1091957.546931089',
  '545978.7734655447',
  '272989.7734655447',
  '272989.3867327723',
  '136494.6933663862',
  '68247.34668319309',
  '34123.67334159654',
  '17061.83667079827',
  '8530.918335399136',
  '4265.459167699568',
  '2132.729583849784'
];
const MB_SCALEDENOMINATOR_4326 = [
  '5.590822640287176E8',
  '2.795411320143588E8',
  '1.397705660071794E8',
  '6.98852830035897E7',
  '3.494264150179485E7',
  '1.7471320750897426E7',
  '8735660.375448713',
  '4367830.187724357',
  '2183915.0938621783',
  '1091957.5469310891',
  '545978.7734655446',
  '272989.3867327723',
  '136494.69336638614',
  '68247.34668319307',
  '34123.673341596535',
  '17061.836670798268',
  '8530.918335399134'
];
const DEFAULT_WELLKNOWNSCALESET = ['GoogleCRS84Quad', 'GoogleMapsCompatible'];
// 迁徙图最大支持要素数量
const MAX_MIGRATION_ANIMATION_COUNT = 1000;
/**
 * @class WebMapViewModel
 * @category ViewModel
 * @classdesc 对接 iPortal/Online 地图类。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @param {number} id - iPortal|Online 地图 ID。
 * @param {Object} options - 参数。
 * @param {string} [options.target='map'] - 地图容器 ID。
 * @param {string} [options.serverUrl="http://www.supermapol.com"] - SuperMap iPortal/Online 服务器地址。当设置 `id` 时有效。
 * @param {string} [options.accessToken] - 用于访问 SuperMap iPortal 、SuperMap Online 中受保护的服务。当设置 `id` 时有效。
 * @param {string} [options.accessKey] - SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。当设置 `id` 时有效。
 * @param {String} [options.tiandituKey] - 用于访问天地图的服务。当设置 `id` 时有效。
 * @param {boolean} [options.withCredentials=false] - 请求是否携带 cookie。当设置 `id` 时有效。
 * @param {boolean} [options.excludePortalProxyUrl] - server 传递过来的 URL 是否带有代理。当设置 `id` 时有效。
 * @fires WebMapViewModel#mapinitialized
 * @fires WebMapViewModel#getmapinfofailed
 * @fires WebMapViewModel#getwmtsinfofailed
 * @fires WebMapViewModel#getlayerdatasourcefailed
 * @fires WebMapViewModel#addlayerssucceeded
 */
interface webMapOptions {
  target?: string;
  serverUrl?: string;
  accessToken?: string;
  accessKey?: string;
  tiandituKey?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  center?: number[];
  zoom?: number;
}

interface mapOptions {
  center?: [number, number] | mapboxglTypes.LngLatLike | { lon: number; lat: number };
  zoom?: number;
  maxBounds?: [[number, number], [number, number]] | mapboxglTypes.LngLatBoundsLike;
  minZoom?: number;
  maxZoom?: number;
  renderWorldCopies?: boolean;
  bearing?: number;
  pitch?: number;
  style?: any;
  container?: string;
  crs: string;
}

type layerType = 'POINT' | 'LINE' | 'POLYGON';

export default class WebMapViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  mapId: string;

  mapOptions: any;

  serverUrl: string;

  accessToken: string;

  accessKey: string;

  tiandituKey: string;

  withCredentials: boolean;

  target: string;

  excludePortalProxyUrl: boolean;

  center: number[];

  zoom: number;

  mapParams: { title?: string; description?: string };

  baseProjection: string;

  on: any;

  fire: any;

  echartslayer: any = [];

  private _sourceListModel: SourceListModel;

  private _legendList: any;

  private _layers: any = [];

  private _svgDiv: HTMLElement;

  private _fieldMaxValue: any;

  private _taskID: Date;

  private layerAdded: number;

  private _handleDataflowFeaturesCallback: Function;

  private _dataflowService: any;

  constructor(id, options: webMapOptions = {}, mapOptions: any = { version: 8, sources: {}, layers: [] }) {
    super();
    this.mapId = id;
    this.mapOptions = mapOptions;
    this.serverUrl = options.serverUrl || 'http://www.supermapol.com';
    this.accessToken = options.accessToken;
    this.accessKey = options.accessKey;
    this.tiandituKey = options.tiandituKey || '';
    this.withCredentials = options.withCredentials || false;
    this.target = options.target || 'map';
    this.excludePortalProxyUrl = options.excludePortalProxyUrl;
    this.center = mapOptions.center || [];
    this.zoom = mapOptions.zoom;
    this.echartslayer = [];
    this._createWebMap();
  }
  /**
   * @function WebMapViewModel.prototype.resize
   * @description Map 更新大小。
   */
  resize(): void {
    this.map && this.map.resize();
    this.echartsLayerResize();
  }
  /**
   * @function WebMapViewModel.prototype.EchartsLayerResize
   * @description echartslayer 更新大小。
   */
  echartsLayerResize(): void {
    this.echartslayer.forEach(echartslayer => {
      echartslayer.chart.resize();
    });
  }

  /**
   * @function WebMapViewModel.prototype.setMapId
   * @description 设置地图 ID。
   * @param {String} mapId - iPortal|Online 地图 ID。
   */
  setMapId(mapId: string): void {
    this.mapId = mapId;
    setTimeout(() => {
      this._createWebMap();
    }, 0);
  }

  /**
   * @function WebMapViewModel.prototype.setServerUrl
   * @description 设置地图的地址。
   * @param {string} options.serverUrl - 地图的地址。
   */
  setServerUrl(serverUrl: string): void {
    this.serverUrl = serverUrl;
  }

  setWithCredentials(withCredentials) {
    this.withCredentials = withCredentials;
  }
  /**
   * @function WebMapViewModel.prototype.setCRS
   * @description 设置地图的投影。
   * @param {Number} crs - 地图投影。
   */
  setCrs(crs): void {
    if (this.map) {
      this.mapOptions.crs = crs;
      //@ts-ignore
      crs && this.map.setCRS(mapboxgl.CRS.get(crs));
    }
  }
  /**
   * @function WebMapViewModel.prototype.setZoom
   * @description 设置地图的缩放级别。
   * @param {Number} zoom - 地图缩放级别。
   */
  setZoom(zoom): void {
    if (this.map) {
      this.mapOptions.zoom = zoom;
      (zoom || zoom === 0) && this.map.setZoom(zoom);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setCenter
   * @description 设置地图的中心点。
   * @param {Array} center - 地图中心点。
   */
  setCenter(center): void {
    if (this.map) {
      this.mapOptions.center = center;
      center && (<[number, number]>center).length > 0 && this.map.setCenter(center);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setMaxBounds
   * @description 设置地图的最大范围。
   * @param {Array} maxBounds - 地图最大范围。
   */
  setMaxBounds(maxBounds): void {
    if (this.map) {
      this.mapOptions.maxBounds = maxBounds;
      maxBounds && (<[[number, number], [number, number]]>maxBounds).length > 0 && this.map.setMaxBounds(maxBounds);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setMinZoom
   * @description 设置地图的最小级别。
   * @param {Number} minZoom - 地图最小级别。
   */
  setMinZoom(minZoom): void {
    if (this.map) {
      this.mapOptions.minZoom = minZoom;
      (minZoom || minZoom === 0) && this.map.setMinZoom(minZoom);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setMaxZoom
   * @description 设置地图的最大级别。
   * @param {Number} maxZoom - 地图最大级别。
   */
  setMaxZoom(maxZoom): void {
    if (this.map) {
      this.mapOptions.maxZoom = maxZoom;
      (maxZoom || maxZoom === 0) && this.map.setMinZoom(maxZoom);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setRenderWorldCopies
   * @description 设置地图的平铺。
   * @param {Boolean} renderWorldCopies - 地图是否平铺。
   */
  setRenderWorldCopies(renderWorldCopies): void {
    if (this.map) {
      this.mapOptions.renderWorldCopies = renderWorldCopies;
      renderWorldCopies && this.map.setRenderWorldCopies(renderWorldCopies);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setBearing
   * @description 设置地图的方位。
   * @param {Number} bearing - 地图的初始方位。
   */
  setBearing(bearing): void {
    if (this.map) {
      this.mapOptions.bearing = bearing;
      (bearing || bearing === 0) && this.map.setBearing(bearing);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setPitch
   * @description 设置地图的俯仰。
   * @param {Number} pitch - 地图的初始俯仰。
   */
  setPitch(pitch): void {
    if (this.map) {
      this.mapOptions.pitch = pitch;
      (pitch || pitch === 0) && this.map.setPitch(pitch);
    }
  }
  /**
   * @function WebMapViewModel.prototype.setStyle
   * @description 设置地图的样式。
   * @param {Object} style - 地图的样式。
   */
  setStyle(style): void {
    if (this.map) {
      this.mapOptions.style = style;
      style && this.map.setStyle(style);
    }
  }

  get getSourceListModel(): SourceListModel {
    return this._sourceListModel;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createWebMap
   * @description 登陆窗口后添加地图图层。
   */
  private _createWebMap(): void {
    if (this.map) {
      this.map.remove();
      this.center = [];
      this.zoom = null;
      this._dataflowService && this._dataflowService.off('messageSucceeded', this._handleDataflowFeaturesCallback);
    }
    if (!this.mapId || !this.serverUrl) {
      this.mapOptions.container = this.target;
      setTimeout(() => {
        this.map = new mapboxgl.Map(this.mapOptions);
        this.map.on('load', () => {
          this.fire('addlayerssucceeded', {
            map: this.map,
            mapparams: {},
            layers: []
          });
        });
      }, 0);

      return;
    }
    this._legendList = {};
    this._taskID = new Date();
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
    this._getMapInfo(mapUrl, this._taskID);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createMap
   * @description 创建地图。
   */
  private _createMap(mapInfo: any): void {
    // 获取字体样式
    let fonts: string[] = [];
    let layers = mapInfo.layers;
    // 获取 label 图层字体类型
    if (layers && layers.length > 0) {
      layers.forEach(layer => {
        layer.labelStyle && fonts.push(layer.labelStyle.fontFamily);
      }, this);
    }
    fonts.push("'supermapol-icons'");
    let fontFamilys: string = fonts.join(',');

    // zoom
    let center: [number, number] | mapboxglTypes.LngLat;
    center = mapInfo.center && [mapInfo.center.x, mapInfo.center.y];

    // center
    let zoom = mapInfo.level || 0;
    zoom = zoom === 0 ? 0 : zoom - 1;

    if (!center) {
      center = [0, 0];
    }
    if (this.baseProjection === 'EPSG:3857') {
      center = this._unproject(center);
    }

    center = new mapboxgl.LngLat(center[0], center[1]);

    // 初始化 map

    this.map = new mapboxgl.Map({
      container: this.target,
      center: this.center.length ? this.center : center,
      zoom: this.zoom || zoom,
      style: {
        version: 8,
        sources: {},
        // "glyphs": 'http://iclsvr.supermap.io/iserver/services/map-beijing/rest/maps/beijingMap/tileFeature/sdffonts/{fontstack}/{range}.pbf',
        layers: []
      },
      // @ts-ignore -------- crs 为 enhance 新加属性
      crs: this.baseProjection,
      localIdeographFontFamily: fontFamilys || '',
      renderWorldCopies: false,
      preserveDrawingBuffer: this.mapOptions.preserveDrawingBuffer || false
    });
    /**
     * @event WebMapViewModel#mapinitialized
     * @description Map 初始化成功。
     * @property {mapboxglTypes.Map} map - MapBoxGL Map 对象。
     */
    this.fire('mapinitialized', { map: this.map });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getMapInfo
   * @description 获取地图的 JSON 信息。
   * @param {string} url - 请求地图的 url。
   */
  private _getMapInfo(url: string, _taskID): void {
    let mapUrl: string = url.indexOf('.json') === -1 ? `${url}.json` : url;

    SuperMap.FetchRequest.get(mapUrl, null, {
      withCredentials: this.withCredentials
    })
      .then(response => {
        return response.json();
      })
      .then(mapInfo => {
        this.baseProjection = mapInfo.projection;

        // 存储地图的名称以及描述等信息，返回给用户
        this.mapParams = {
          title: mapInfo.title,
          description: mapInfo.description
        };
        // 坐标系异常处理
        if (mapboxgl.CRS.get(this.baseProjection)) {
          this._createMap(mapInfo);

          let layers = mapInfo.layers;

          this.map.on('load', () => {
            if (mapInfo.baseLayer && mapInfo.baseLayer.layerType === 'MAPBOXSTYLE') {
              // 添加矢量瓦片服务作为底图
              this._addMVTBaseMap(mapInfo);
            } else {
              this._addBaseMap(mapInfo);
            }
            if (!layers || layers.length === 0) {
              this._sendMapToUser(0, 0);
            } else {
              this._addLayers(layers, _taskID);
            }
          });
        } else {
          throw Error(geti18n().t('webmap.crsNotSupport'));
        }
      })
      .catch(error => {
        /**
         * @event WebMapViewModel#getmapinfofailed
         * @description 获取地图信息失败。
         * @property {Object} error - 失败原因。
         */
        this.fire('getmapinfofailed', { error: error });
      });
  }

  private _addMVTBaseMap(mapInfo) {
    let baseLayer = mapInfo.baseLayer,
      url = baseLayer.dataSource.url;
    // @ts-ignore
    this.map.addStyle(url);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._addBaseMap
   * @description 添加底图。
   * @param {Object} mapInfo - map 信息。
   */
  private _addBaseMap(mapInfo: any): void {
    this._createBaseLayer(mapInfo);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createBaseLayer
   * @description 创建底图。
   * @param {Object} mapInfo - map 信息。
   */
  private _createBaseLayer(mapInfo: any): void {
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
      CLOUD: 'http://t2.supermapcloud.com/FileService/image?map=quanguo&type=web&x={x}&y={y}&z={z}',
      CLOUD_BLACK: 'http://t3.supermapcloud.com/MapService/getGdp?x={x}&y={y}&z={z}',
      OSM: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      GOOGLE:
        'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2szh-CN!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0',
      GOOGLE_CN: 'https://mt{0-3}.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
      JAPAN_STD: 'http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
      JAPAN_PALE: 'http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
      JAPAN_RELIEF: 'http://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
      JAPAN_ORT: 'http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg'
    };

    let url: string;

    switch (layerType) {
      case 'TIANDITU_VEC':
      case 'TIANDITU_IMG':
      case 'TIANDITU_TER':
        this._createTiandituLayer(mapInfo);
        break;
      case 'BING':
        this._createBingLayer(layerInfo.name);
        break;
      case 'WMS':
        this._createWMSLayer(layerInfo);
        break;
      case 'WMTS':
        this._createWMTSLayer(layerInfo);
        break;
      case 'TILE':
      case 'SUPERMAP_REST':
        this._createDynamicTiledLayer(layerInfo);
        break;
      case 'CLOUD':
      case 'CLOUD_BLACK':
      case 'OSM':
      case 'JAPAN_ORT':
      case 'JAPAN_RELIEF':
      case 'JAPAN_PALE':
      case 'JAPAN_STD':
      case 'GOOGLE_CN':
      case 'GOOGLE':
        url = mapUrls[layerType];
        this._createXYZLayer(layerInfo, url);
        break;
      default:
        break;
    }
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createTiandituLayer
   * @description 创建天地图底图。
   * @param {Object} mapInfo - map 信息。
   */
  private _createTiandituLayer(mapInfo: any): void {
    let tiandituUrls = this._getTiandituUrl(mapInfo);
    let layerType = mapInfo.baseLayer.layerType;
    let isLabel = Boolean(mapInfo.baseLayer.labelLayerVisible);
    let labelUrl = tiandituUrls['labelUrl'];
    let tiandituUrl = tiandituUrls['tiandituUrl'];
    this._addBaselayer(tiandituUrl, 'tianditu-layers-' + layerType);
    isLabel && this._addBaselayer(labelUrl, 'tianditu-label-layers-' + layerType);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createWMTSLayer
   * @description 创建 WMTS 底图。
   * @param {Object} layerInfo - 地图信息。
   */
  private _createWMTSLayer(layerInfo: any): void {
    let wmtsUrl = this._getWMTSUrl(layerInfo);
    this._filterWMTSIsMatched(layerInfo, (isMatched, matchMaxZoom) => {
      isMatched && this._addBaselayer([wmtsUrl], 'wmts-layers' + layerInfo.name, 0, matchMaxZoom);
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._filterWMTSIsMatched
   * @description 过滤能够跟mapboxgl匹配的wmts服务。
   * @param {Object} mapInfo - map 信息。
   * @callback matchedCallback
   */
  private _filterWMTSIsMatched(mapInfo: any, matchedCallback: Function): void {
    let isMatched = false;
    let matchMaxZoom = 22;
    let url = mapInfo.url;
    let options = {
      withCredentials: false,
      withoutFormatSuffix: true
    };

    SuperMap.FetchRequest.get(url, null, options)
      .then(response => {
        return response.text();
      })
      .then(capabilitiesText => {
        let converts = convert || window.convert;
        let tileMatrixSet = JSON.parse(
          converts.xml2json(capabilitiesText, {
            compact: true,
            spaces: 4
          })
        ).Capabilities.Contents.TileMatrixSet;
        for (let i = 0; i < tileMatrixSet.length; i++) {
          if (
            tileMatrixSet[i]['ows:Identifier'] &&
            tileMatrixSet[i]['ows:Identifier']['_text'] === mapInfo.tileMatrixSet
          ) {
            if (DEFAULT_WELLKNOWNSCALESET.includes(tileMatrixSet[i]['WellKnownScaleSet']['_text'])) {
              isMatched = true;
            } else if (
              tileMatrixSet[i]['WellKnownScaleSet'] &&
              tileMatrixSet[i]['WellKnownScaleSet']['_text'] === 'Custom'
            ) {
              let matchedScaleDenominator = [];
              // 坐标系判断
              let defaultCRSScaleDenominators =
                // @ts-ignore -------- crs 为 enhance 新加属性
                this.map.crs === 'EPSG:3857' ? MB_SCALEDENOMINATOR_3857 : MB_SCALEDENOMINATOR_4326;

              for (let j = 0, len = defaultCRSScaleDenominators.length; j < len; j++) {
                if (!tileMatrixSet[i].TileMatrix[j]) {
                  break;
                }
                if (defaultCRSScaleDenominators[j] !== tileMatrixSet[i].TileMatrix[j]['ScaleDenominator']['_text']) {
                  break;
                }
                matchedScaleDenominator.push(defaultCRSScaleDenominators[j]);
              }
              matchMaxZoom = matchedScaleDenominator.length - 1;
              if (matchedScaleDenominator.length !== 0) {
                isMatched = true;
              } else {
                throw Error(geti18n().t('webmap.TileMatrixSetNotSuppport'));
              }
            } else {
              throw Error(geti18n().t('webmap.TileMatrixSetNotSuppport'));
            }
          }
        }
        matchedCallback(isMatched, matchMaxZoom);
      })
      .catch(error => {
        /**
         * @event WebMapViewModel#getmapinfofailed
         * @description 获取地图信息失败。
         * @property {Object} error - 失败原因。
         */
        this.fire('getmapinfofailed', { error: error });
      });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createBingLayer
   * @description 创建 Bing 图层。
   */
  private _createBingLayer(layerName: string): void {
    let bingUrl =
      'http://dynamic.t0.tiles.ditu.live.com/comp/ch/{quadkey}?it=G,TW,L,LA&mkt=zh-cn&og=109&cstl=w4c&ur=CN&n=z';
    // @ts-ignore
    this._addBaselayer([bingUrl], 'bing-layers-' + layerName);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createXYZLayer
   * @description 创建 XYZ 底图。
   * @param {String} url - url 地址。
   */
  private _createXYZLayer(layerInfo: any, url: string): void {
    let urlArr: string[] = [];

    if (layerInfo.layerType === 'OSM') {
      let res = url.match(/\w\-\w/g)[0];
      let start = res[0];
      let end = res[2];
      let alphabet = '';
      for (let i = 97; i < 123; i++) {
        alphabet += String.fromCharCode(i);
      }
      let alphabetArr = alphabet.split('');

      let startIndex = alphabetArr.indexOf(start);
      let endIndex = alphabetArr.indexOf(end);

      let res3 = alphabetArr.slice(startIndex, endIndex + 1);

      for (let i = 0; i < res3.length; i++) {
        let replaceRes = url.replace(/{\w\-\w}/g, res3[i]);
        urlArr.push(replaceRes);
      }
    } else if (layerInfo.layerType === 'GOOGLE_CN') {
      let res = url.match(/\d\-\d/g)[0];
      let start = parseInt(res[0]);
      let end = parseInt(res[2]);

      for (let i = start; i <= end; i++) {
        let replaceRes = url.replace(/{\d\-\d}/g, i.toString());
        urlArr.push(replaceRes);
      }
    } else {
      urlArr = [url];
    }
    this._addBaselayer(urlArr, 'XYZ-layers-' + layerInfo.name);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createDynamicTiledLayer
   * @description 创建 iserver 底图。
   * @param {Object} layerInfo - 图层信息。
   */
  private _createDynamicTiledLayer(layerInfo: any): void {
    let url = layerInfo.url;
    this._addBaselayer([url], 'tile-layers-' + layerInfo.name, null, null, true);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createWMSLayer
   * @description 创建 WMS 图层。
   * @param {Object} layerInfo - 图层信息。
   */
  private _createWMSLayer(layerInfo: any): void {
    let WMSUrl = this._getWMSUrl(layerInfo);
    this._addBaselayer([WMSUrl], 'WMS-layers-' + layerInfo.name);
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createVectorLayer
   * @description 创建 Vector 图层。
   * @param {Object} layerInfo - map 信息。
   * @param {Array} features - 属性 信息。
   */
  private _createVectorLayer(layerInfo: any, features: any): void {
    let style = layerInfo.style;
    let type = layerInfo.featureType;
    let layerID = layerInfo.layerID;
    let visible = layerInfo.visible;
    let layerStyle = {
      style: this._transformStyleToMapBoxGl(style, type),
      layout: {
        visibility: visible
      }
    };
    let source: mapboxglTypes.GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    };
    this._addOverlayToMap(type, source, layerID, layerStyle);
    // 如果面有边框
    type === 'POLYGON' &&
      style.strokeColor &&
      this._addStrokeLineForPoly(style, source, layerID + '-strokeLine', visible);
  }

  /**
   * @function WebMapViewModel.prototype._getTiandituUrl
   * @private
   * @description 创建天地图url;
   * @param {Object} mapInfo - map 信息。
   */
  private _getTiandituUrl(mapInfo: any): { tiandituUrl: Array<string>; labelUrl: Array<string> } {
    let re: RegExp = /t0/gi;
    type urlArr = Array<string>;
    let tiandituUrls: { tiandituUrl: urlArr; labelUrl: urlArr } = { tiandituUrl: [], labelUrl: [] };

    let layerType = mapInfo.baseLayer.layerType.split('_')[1].toLowerCase();
    let isLabel = Boolean(mapInfo.baseLayer.labelLayerVisible);

    let url = `http://t0.tianditu.com/{layer}_{proj}/wmts?tk=${this.tiandituKey}`;
    let labelUrl = url;

    let layerLabelMap = {
      vec: 'cva',
      ter: 'cta',
      img: 'cia'
    };

    let tilematrixSet = this.baseProjection === 'EPSG:4326' ? 'c' : 'w';
    let options = {
      service: 'WMTS',
      request: 'GetTile',
      style: 'default',
      version: '1.0.0',
      layer: layerType,
      tilematrixSet: tilematrixSet,
      format: 'tiles',
      width: 256,
      height: 256
    };

    url += this._getParamString(options, url) + '&tilematrix={z}&tilerow={y}&tilecol={x}';

    let tiandituUrl = url.replace('{layer}', layerType).replace('{proj}', tilematrixSet);
    let tiandituUrlArr: string[] = [];

    for (let i = 0; i < 8; i++) {
      tiandituUrlArr.push(tiandituUrl.replace(re, `t${i}`));
    }
    tiandituUrls['tiandituUrl'] = tiandituUrlArr;

    // 如果有 label 图层
    if (isLabel) {
      let labelLayer = layerLabelMap[layerType];
      options.layer = labelLayer;
      labelUrl += this._getParamString(options, labelUrl) + '&tilematrix={z}&tilerow={y}&tilecol={x}';
      labelUrl = labelUrl.replace('{layer}', labelLayer).replace('{proj}', tilematrixSet);
      let labelUrlArr = [];
      for (let i = 0; i < 8; i++) {
        labelUrlArr.push(labelUrl.replace(re, `t${i}`));
      }
      tiandituUrls['labelUrl'] = labelUrlArr;
    }

    return tiandituUrls;
  }

  /**
   * @function WebMapViewModel.prototype._getWMSUrl
   * @private
   * @description 创建 WMS url;
   * @param {Object} mapInfo - map 信息。
   */
  private _getWMSUrl(mapInfo: any): string {
    let url = mapInfo.url;
    url = url.split('?')[0];
    let strArr = url.split('/');
    let options = {
      service: 'WMS',
      request: 'GetMap',
      layers: strArr[strArr.length - 1],
      styles: '',
      format: 'image/png',
      transparent: 'true',
      version: '1.1.1',
      width: 256,
      height: 256,
      srs: this.baseProjection
    };
    let bbox = this.baseProjection === 'EPSG:4326' ? '{bbox-epsg-4326}' : '{bbox-epsg-3857}';
    url += this._getParamString(options, url) + `&bbox=${bbox}`;
    return url;
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
   * @function ol.supermap.WebMap.prototype._getDataService
   * @description 获取上传的数据信息
   * @param {String} fileId - 文件id
   * @param {String} datasetName 数据服务的数据集名称
   *  @returns {Promise<T | never>} 数据的信息
   */
  _getDataService(fileId, datasetName) {
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

  /**
   * @private
   * @function WebMapViewModel.prototype._getService
   * @description 获取当前数据发布的服务中的某种类型服务
   * @param {Array} services 服务集合
   * @param {String} type 服务类型，RESTDATA, RESTMAP
   * @returns {Object} 服务
   */
  _getService(services, type) {
    let service = services.filter(info => {
      return info && info.serviceType === type;
    });
    return service[0];
  }

  _getServiceInfoFromLayer(layerIndex, len, layer, dataItemServices, datasetName, featureType, info?: any) {
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
            this.layerAdded++;
            this._sendMapToUser(this.layerAdded, len);
          });
        });
      } // TODO 对接 MVT
      else if (service && !isMapService && service.serviceType === 'RESTDATA') {
        if (info && info.isMvt) {
          this._addVectorLayer(info, layer, featureType);
          this.layerAdded++;
          this._sendMapToUser(this.layerAdded, len);
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
                this.layerAdded++;
                this._sendMapToUser(this.layerAdded, len);
              },
              err => {
                this.layerAdded++;
                this._sendMapToUser(this.layerAdded, len);
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
      this.layerAdded++;
      this._sendMapToUser(this.layerAdded, len);
      this.fire('getlayerdatasourcefailed', {
        error: null,
        layer: layer,
        map: this.map
      });
    }
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
   * @function WebMapViewModel.prototype._addLayers
   * @description 添加叠加图层。
   * @param {Object} mapInfo - 图层信息。
   */
  private _addLayers(layers: any, _taskID): void {
    // 存储地图上所有的图层对象
    this._layers = layers;

    let features;
    this.layerAdded = 0;
    let len = layers.length;
    if (len > 0) {
      layers.forEach((layer, index) => {
        if (
          (layer.dataSource && layer.dataSource.serverId) ||
          layer.layerType === 'MARKER' ||
          layer.layerType === 'HOSTED_TILE'
        ) {
          //数据存储到iportal上了
          let dataSource = layer.dataSource,
            serverId = dataSource ? dataSource.serverId : layer.serverId;
          if (!serverId) {
            this._addLayer(layer, null, index);
            this.layerAdded++;
            this._sendMapToUser(this.layerAdded, len);
            return;
          }
          if (
            layer.layerType === 'MARKER' ||
            (dataSource && (!dataSource.accessType || dataSource.accessType === 'DIRECT'))
          ) {
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
                  this.layerAdded++;
                  this._sendMapToUser(this.layerAdded, len);
                  // -----------------------todo-----------------
                  this.fire('getlayerdatasourcefailed', {
                    error: data.error,
                    layer: layer,
                    map: this.map
                  });
                  return;
                }
                if (data && data.type) {
                  if (data.type === 'JSON' || data.type === 'GEOJSON') {
                    data.content = JSON.parse(data.content.trim());
                    features = this._formatGeoJSON(data.content);
                  } else if (data.type === 'EXCEL' || data.type === 'CSV') {
                    features = this._excelData2Feature(data.content);
                  }
                  this._addLayer(layer, features, index);
                  this.layerAdded++;
                  this._sendMapToUser(this.layerAdded, len);
                }
              })
              .catch(error => {
                this.layerAdded++;
                this._sendMapToUser(this.layerAdded, len);
                this.fire('getlayerdatasourcefailed', {
                  error: error,
                  layer: layer,
                  map: this.map
                });
              });
          } else {
            //关系型文件
            let isMapService = layer.layerType === 'HOSTED_TILE',
              serverId = dataSource ? dataSource.serverId : layer.serverId;
            this._checkUploadToRelationship(serverId)
              .then(result => {
                if (result && result.length > 0) {
                  let datasetName = result[0].name,
                    featureType = result[0].type.toUpperCase();
                  this._getDataService(serverId, datasetName).then(data => {
                    let dataItemServices = data.dataItemServices;
                    if (dataItemServices.length === 0) {
                      this.layerAdded++;
                      this._sendMapToUser(this.layerAdded, len);
                      this.fire('getlayerdatasourcefailed', {
                        error: null,
                        layer: layer,
                        map: this.map
                      });
                      return;
                    }
                    if (isMapService) {
                      let dataService = dataItemServices.filter(info => {
                        return info && info.serviceType === 'RESTDATA';
                      })[0];
                      this._isMvt(dataService.address, datasetName)
                        .then(info => {
                          this._getServiceInfoFromLayer(
                            index,
                            len,
                            layer,
                            dataItemServices,
                            datasetName,
                            featureType,
                            info
                          );
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
                  this.layerAdded++;
                  this._sendMapToUser(this.layerAdded, len);
                  this.fire('getlayerdatasourcefailed', {
                    error: null,
                    layer: layer,
                    map: this.map
                  });
                }
              })
              .catch(error => {
                this.layerAdded++;
                this._sendMapToUser(this.layerAdded, len);
                this.fire('getlayerdatasourcefailed', {
                  error: error,
                  layer: layer,
                  map: this.map
                });
              });
          }
        } else if (
          layer.layerType === 'SUPERMAP_REST' ||
          layer.layerType === 'TILE' ||
          layer.layerType === 'WMS' ||
          layer.layerType === 'WMTS'
        ) {
          this._createBaseLayer(layer);
          this.layerAdded++;
          this._sendMapToUser(this.layerAdded, len);
        } else if (layer.dataSource && layer.dataSource.type === 'REST_DATA') {
          //从restData获取数据
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
              this.layerAdded++;
              this._sendMapToUser(this.layerAdded, len);
            },
            err => {
              this.layerAdded++;
              this._sendMapToUser(this.layerAdded, len);
              this.fire('getlayerdatasourcefailed', {
                error: err,
                layer: layer,
                map: this.map
              });
            }
          );
        } else if (layer.dataSource && layer.dataSource.type === 'REST_MAP' && layer.dataSource.url) {
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
                    this.layerAdded++;
                    this._sendMapToUser(this.layerAdded, len);
                  },
                  err => {
                    this.layerAdded++;
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
              this.fire('getlayerdatasourcefailed', {
                error: err,
                layer: layer,
                map: this.map
              });
            },
            'smid=1'
          );
        } else if (layer.layerType === 'DATAFLOW_POINT_TRACK' || layer.layerType === 'DATAFLOW_HEAT') {
          this._getDataflowInfo(
            layer,
            () => {
              this._addLayer(layer, null, index);
              this.layerAdded++;
              this._sendMapToUser(this.layerAdded, len);
            },
            e => {
              this.layerAdded++;
              // TODO  fire faild
            }
          );
        }
      }, this);
    }
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

  /**
   * @private
   * @function WebMapViewModel.prototype._addLayer
   * @description 将单个图层添加到地图上。
   * @param layerInfo  某个图层的图层信息
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _addLayer(layerInfo: any, features: any, index: number | string): void {
    let layerType = layerInfo.layerType;
    layerInfo.layerID = layerType + '-' + layerInfo.name + '-' + index;
    layerInfo.visible = layerInfo.visible ? 'visible' : 'none';
    // mbgl 目前不能处理 geojson 复杂面情况
    // mbgl isssue https://github.com/mapbox/mapbox-gl-js/issues/7023
    if (features && features[0] && features[0].geometry.type === 'Polygon') {
      features = handleMultyPolygon(features);
    }

    if (layerInfo.style && layerInfo.filterCondition) {
      // 将 feature 根据过滤条件进行过滤, 分段专题图和单值专题图因为要计算 styleGroup 所以暂时不过滤
      if (layerType !== 'RANGE' && layerType !== 'UNIQUE' && layerType !== 'RANK_SYMBOL') {
        features = this._getFiterFeatures(layerInfo.filterCondition, features);
      }
    }

    if (features && layerInfo.projection !== 'EPSG:4326') {
      this._transformFeatures(features);
    }

    if (layerType === 'VECTOR') {
      if (layerInfo.featureType === 'POINT') {
        if (layerInfo.style.type === 'SYMBOL_POINT') {
          this._createSymbolLayer(layerInfo, features);
        } else {
          this._createGraphicLayer(layerInfo, features);
        }
      } else {
        // 线和面
        this._createVectorLayer(layerInfo, features);
      }
    } else if (layerType === 'UNIQUE') {
      this._createUniqueLayer(layerInfo, features);
    } else if (layerType === 'RANGE') {
      this._createRangeLayer(layerInfo, features);
    } else if (layerType === 'HEAT') {
      this._createHeatLayer(layerInfo, features);
    } else if (layerType === 'MARKER') {
      this._createMarkerLayer(layerInfo, features);
    } else if (layerInfo.layerType === 'MIGRATION') {
      this._createMigrationLayer(layerInfo, features);
    } else if (layerInfo.layerType === 'RANK_SYMBOL') {
      this._createRankSymbolLayer(layerInfo, features);
    } else if (layerInfo.layerType === 'DATAFLOW_POINT_TRACK' || layerInfo.layerType === 'DATAFLOW_HEAT') {
      this._createDataflowLayer(layerInfo);
    }
    if (layerInfo.labelStyle && layerInfo.labelStyle.labelField && layerInfo.layerType !== 'DATAFLOW_POINT_TRACK') {
      // 存在标签专题图
      this._addLabelLayer(layerInfo, features);
    }
  }
  private _createDataflowLayer(layerInfo) {
    let dataflowService = new mapboxgl.supermap.DataFlowService(layerInfo.wsUrl).initSubscribe();
    this._handleDataflowFeaturesCallback = this._handleDataflowFeatures.bind(this, layerInfo);
    dataflowService.on('messageSucceeded', this._handleDataflowFeaturesCallback);
    this._dataflowService = dataflowService;
  }

  private _handleDataflowFeatures(layerInfo, e) {
    let features = JSON.parse(e.data);
    // this._transformFeatures([features]); // TODO 坐标系
    this.fire('dataflowfeatureupdated', {
      features,
      identifyField: layerInfo.identifyField,
      layerID: layerInfo.layerID
    });
    if (layerInfo.filterCondition) {
      //过滤条件
      let condition = this._replaceFilterCharacter(layerInfo.filterCondition);
      let sql = 'select * from json where (' + condition + ')';
      let filterResult = window['jsonsql'].query(sql, {
        attributes: features.properties
      });
      if (filterResult && filterResult.length > 0) {
        this._addDataflowLayer(layerInfo, features);
      }
    } else {
      this._addDataflowLayer(layerInfo, features);
    }
  }

  private _getDataFlowRotateStyle(features, directionField, identifyField) {
    let iconRotateExpression = ['match', ['get', identifyField]];
    features.forEach(feature => {
      let value;
      if (directionField !== undefined && directionField !== '未设置' && directionField !== 'None') {
        value = feature.properties[directionField];
      } else {
        value = 0;
      }
      if (value > 360 || value < 0) {
        return null;
      }
      // @ts-ignore
      iconRotateExpression.push(feature.properties[identifyField], parseInt(value));
    });
    // @ts-ignore
    iconRotateExpression.push(0);
    return iconRotateExpression;
  }

  private _addDataflowLayer(layerInfo, feature) {
    let layerID = layerInfo.layerID;
    if (layerInfo.layerType === 'DATAFLOW_HEAT') {
      if (!this.map.getSource(layerID)) {
        this._createHeatLayer(layerInfo, [feature]);
      } else {
        this._updateDataFlowFeature(layerID, feature, layerInfo);
      }
    } else {
      let layerStyle = layerInfo.pointStyle;
      layerInfo.style = layerStyle;
      if (!this.map.getSource(layerID)) {
        let iconRotateExpression = this._getDataFlowRotateStyle(
          [feature],
          layerInfo.directionField,
          layerInfo.identifyField
        );
        if (['BASIC_POINT', 'SVG_POINT', 'IMAGE_POINT'].includes(layerStyle.type)) {
          this._createGraphicLayer(layerInfo, [feature], null, iconRotateExpression);
        } else {
          this._createSymbolLayer(layerInfo, [feature], null, iconRotateExpression);
        }
      } else {
        this._updateDataFlowFeature(layerID, feature, layerInfo, 'point');
      }
      if (layerInfo.labelStyle && layerInfo.visible) {
        if (!this.map.getSource(layerID + 'label')) {
          this._addLabelLayer(layerInfo, [feature]);
        } else {
          this._updateDataFlowFeature(layerID + 'label', feature, layerInfo);
        }
      }
      if (layerInfo.lineStyle && layerInfo.visible) {
        if (!this.map.getSource(layerID + '-line')) {
          let geometry = feature.geometry.coordinates;
          let lineFeature = {
            type: 'Feature',
            properties: feature.properties,
            geometry: {
              type: 'LineString',
              coordinates: [geometry]
            }
          };
          this._createVectorLayer(
            { style: layerInfo.lineStyle, featureType: 'LINE', visible: 'visible', layerID: layerID + '-line' },
            [lineFeature]
          );
        } else {
          this._updateDataFlowFeature(layerID + '-line', feature, layerInfo, 'line');
        }
      }
    }
  }

  private _updateDataFlowFeature(sourceID, newFeature, layerInfo, type?) {
    let { identifyField, maxPointCount, directionField } = layerInfo;
    // @ts-ignore
    let features = cloneDeep(this.map.getSource(sourceID)._data.features);
    let has = false;
    features.map((item, index) => {
      if (item.properties[identifyField] === newFeature.properties[identifyField]) {
        has = true;
        if (type === 'line') {
          let coordinates = item.geometry.coordinates;
          coordinates.push(newFeature.geometry.coordinates);
          if (maxPointCount && coordinates.length > maxPointCount) {
            coordinates.splice(0, coordinates.length - maxPointCount);
          }
          features[index].geometry.coordinates = coordinates;
        } else {
          features[index] = newFeature;
        }
      }
    });
    if (!has) {
      if (type === 'line') {
        features.push({
          type: 'Feature',
          properties: newFeature.properties,
          geometry: {
            type: 'LineString',
            coordinates: [newFeature.geometry.coordinates]
          }
        });
      } else {
        features.push(newFeature);
      }
    }
    // @ts-ignore
    this.map.getSource(sourceID).setData({ type: 'FeatureCollection', features });
    if (type === 'point') {
      let type = layerInfo.pointStyle.type;
      let iconRotateExpression = this._getDataFlowRotateStyle(features, directionField, identifyField);
      if (['SVG_POINT', 'IMAGE_POINT'].includes(type)) {
        this.map.setLayoutProperty(sourceID, 'icon-rotate', iconRotateExpression);
      } else if (type === 'SYMBOL_POINT') {
        this.map.setLayoutProperty(sourceID, 'text-rotate', iconRotateExpression);
      }
    }
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
      .then(function(response) {
        return response.json();
      })
      .then(function(result) {
        if (result && result.featureMetaData) {
          layerInfo.featureType = result.featureMetaData.featureType.toUpperCase();
          layerInfo.dataSource = { dataTypes: {} };
          if (result.featureMetaData.fieldInfos && result.featureMetaData.fieldInfos.length > 0) {
            result.featureMetaData.fieldInfos.forEach(function(data) {
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
      .catch(function() {
        faild();
      });
  }

  private _createMigrationLayer(layerInfo, features) {
    window['echarts'] = echarts;
    let properties = this._getFeatureProperties(features);
    let lineData = this._createLinesData(layerInfo, properties);
    let pointData = this._createPointsData(lineData, layerInfo, properties);
    let options = this._createOptions(layerInfo, lineData, pointData);
    let echartslayer = new EchartsLayer(this.map);
    echartslayer.chart.setOption(options);
    this.echartslayer.push(echartslayer);
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
    let options = {
      GLMap: {
        roam: true
      },
      // geo: {
      //   map: 'GLMap',
      //   label: {
      //     emphasis: {
      //       show: false
      //     }
      //   },
      //   roam: true,
      //   itemStyle: {
      //     normal: {
      //       areaColor: '#323c48',
      //       borderColor: '#404a59'
      //     },
      //     emphasis: {
      //       areaColor: '#2a333d'
      //     }
      //   }
      // },
      series
    };
    return options;
  }

  private _createPointSeries(layerInfo, pointData) {
    let lineSetting = layerInfo.lineSetting;
    let animationSetting = layerInfo.animationSetting;
    let labelSetting = layerInfo.labelSetting;
    let pointSeries = [
      {
        name: 'point-series',
        coordinateSystem: 'GLMap',
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
  private _createLineSeries(layerInfo, lineData) {
    let lineSetting = layerInfo.lineSetting;
    let animationSetting = layerInfo.animationSetting;
    let linesSeries = [
      // 轨迹线样式
      {
        name: 'line-series',
        coordinateSystem: 'GLMap',
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
            return mapboxgl.supermap.Util.isMatchAdministrativeName(item.name, fromField);
          });
          toCoord = centerDatas.find(item => {
            return mapboxgl.supermap.Util.isMatchAdministrativeName(item.name, toField);
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
  private _createRankSymbolLayer(layerInfo, features) {
    let fieldName = layerInfo.themeSetting.themeField;
    let style = layerInfo.style;
    let featureType = layerInfo.featureType;
    let styleSource: any = this._createRankStyleSource(layerInfo, features, layerInfo.featureType);
    let styleGroups = styleSource.styleGroups;
    features = this._getFiterFeatures(layerInfo.filterCondition, features);
    // 获取 expression
    let expression = ['match', ['get', 'index']];
    features.forEach(row => {
      let tartget = parseFloat(row.properties[fieldName]);
      if (styleGroups) {
        for (let i = 0; i < styleGroups.length; i++) {
          if (styleGroups[i].start <= tartget && tartget < styleGroups[i].end) {
            let radius =
              style.type === 'SYMBOL_POINT' || style.type === 'IMAGE_POINT'
                ? style.type === 'SYMBOL_POINT'
                  ? styleGroups[i].radius * 2
                  : Number.parseFloat((styleGroups[i].radius / style.imageInfo.size.h).toFixed(2)) * 2
                : styleGroups[i].radius;
            expression.push(row.properties['index'], radius);
          }
        }
      }
      // @ts-ignore
      !tartget && expression.push(row.properties['index'], 1);
    }, this);
    // @ts-ignore
    expression.push(1);
    if (style.type === 'SYMBOL_POINT') {
      this._createSymbolLayer(layerInfo, features, expression);
    } else if (style.type === 'IMAGE_POINT') {
      this._createGraphicLayer(layerInfo, features, expression);
    } else {
      let source: mapboxglTypes.GeoJSONSourceRaw = {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      };
      // 获取样式
      let layerStyle: any = {
        layout: {
          visibility: layerInfo.visible
        }
      };
      layerStyle.style = this._transformStyleToMapBoxGl(style, featureType, expression, 'circle-radius');
      let layerID = layerInfo.layerID;
      this._addOverlayToMap(featureType, source, layerID, layerStyle);
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
      if (value == null || !mapboxgl.supermap.Util.isNumber(value)) {
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
        styleGroup.push({ radius, start, end });
      }
      return styleGroup;
    } else {
      return false;
    }
  }
  /**
   * @private
   * @function WebMapViewModel.prototype._addLabelLayer
   * @description 添加标签图层。
   * @param layerInfo  某个图层的图层信息。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _addLabelLayer(layerInfo: any, features: any): void {
    let labelStyle = layerInfo.labelStyle;

    this.map.addLayer({
      id: layerInfo.layerID + 'label',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      },
      paint: {
        'text-color': labelStyle.fill,
        'text-halo-color': 'rgba(255,255,255,0.8)',
        'text-halo-width': parseFloat(labelStyle.fontSize) || 12
      },
      layout: {
        'text-field': `{${labelStyle.labelField}}`,
        'text-size': parseFloat(labelStyle.fontSize) || 12,
        'text-offset': labelStyle.offsetX ? [labelStyle.offsetX / 10 || 0, labelStyle.offsetY / 10 || 0] : [0, -2.5],
        'text-font': ['DIN Offc Pro Italic', 'Arial Unicode MS Regular'],
        visibility: layerInfo.visible
      }
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createSymbolLayer
   * @description 添加 symbol 图层。
   * @param layerInfo  某个图层的图层信息。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createSymbolLayer(layerInfo: any, features: any, textSize?, textRotateExpresion?): void {
    // 用来请求symbol_point字体文件
    let target = document.getElementById(`${this.target}`);
    target.classList.add('supermapol-icons-map');

    let style = layerInfo.style;
    let unicode = layerInfo.style.unicode;
    let text = String.fromCharCode(parseInt(unicode.replace(/^&#x/, ''), 16));
    let layerID = layerInfo.layerID;
    this.map.addSource(layerID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    this.map.addLayer({
      id: layerID,
      type: 'symbol',
      source: layerID,
      paint: {
        'text-color': style.fillColor
      },
      layout: {
        'text-field': text,
        'text-size': textSize || (style.fontSize && parseFloat(style.fontSize)) || 12,
        'text-font': ['DIN Offc Pro Italic', 'Arial Unicode MS Regular'],
        'text-rotate': textRotateExpresion || 0,
        visibility: layerInfo.visible
      }
    });
    // @ts-ignore
    this.map.getSource(layerID).setData({
      type: 'FeatureCollection',
      features: features
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createGraphicLayer
   * @description 创建 Graphic 图层。
   * @param {Object} layerInfo - map 信息。
   * @param {Array} features - 属性 信息。
   */
  private _createGraphicLayer(layerInfo: any, features: any, iconSizeExpression?, iconRotateExpression?) {
    let style = layerInfo.style;
    let layerID = layerInfo.layerID;
    let source: mapboxglTypes.GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    };

    if (style.type === 'IMAGE_POINT') {
      let imageInfo = style.imageInfo;
      this.map.loadImage(imageInfo.url, (error, image) => {
        if (error) {
          console.log(error);
        }
        let iconSize = Number.parseFloat((style.radius / image.height).toFixed(2)) * 2;
        this.map.addImage('imageIcon', image);
        this.map.addLayer({
          id: layerID,
          type: 'symbol',
          source: source,
          layout: {
            'icon-image': 'imageIcon',
            'icon-size': iconSizeExpression || iconSize,
            visibility: layerInfo.visible,
            'icon-rotate': iconRotateExpression || 0
          }
        });
      });
    } else if (style.type === 'SVG_POINT') {
      let svgUrl = style.url;
      if (!this._svgDiv) {
        this._svgDiv = document.createElement('div');
        document.body.appendChild(this._svgDiv);
      }
      this._getCanvasFromSVG(svgUrl, this._svgDiv, canvas => {
        let imgUrl = canvas.toDataURL('img/png');
        imgUrl &&
          this.map.loadImage(imgUrl, (error, image) => {
            if (error) {
              console.log(error);
            }
            let iconSize = Number.parseFloat((style.radius / canvas.width).toFixed(2));
            this.map.addImage('imageIcon', image);
            this.map.addLayer({
              id: layerID,
              type: 'symbol',
              source: source,
              layout: {
                'icon-image': 'imageIcon',
                'icon-size': iconSizeExpression || iconSize,
                visibility: layerInfo.visible,
                'icon-rotate': iconRotateExpression || 0
              }
            });
          });
      });
    } else {
      let layerStyle = {
        style: this._transformStyleToMapBoxGl(style, layerInfo.featureType),
        layout: {
          visibility: layerInfo.visible
        }
      };
      this._addOverlayToMap('POINT', source, layerID, layerStyle);
    }
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createUniqueLayer
   * @description 创建单值图层。
   * @param layerInfo  某个图层的图层信息
   * @param features   图层上的 feature
   */
  private _createUniqueLayer(layerInfo: any, features: any): void {
    let styleGroup = this._getUniqueStyleGroup(layerInfo, features);
    features = this._getFiterFeatures(layerInfo.filterCondition, features);

    let style = layerInfo.style;
    let themeField = layerInfo.themeSetting.themeField;
    Object.keys(features[0].properties).forEach(key => {
      key.toLocaleUpperCase() === themeField.toLocaleUpperCase() && (themeField = key);
    });
    let type = layerInfo.featureType;
    let expression = ['match', ['get', 'index']];
    let layerID = layerInfo.layerID;

    features.forEach(row => {
      styleGroup.forEach(item => {
        if (item.value === row.properties[themeField]) {
          expression.push(row.properties['index'], item.color);
        }
      });
    });
    expression.push('#ffffff');

    // 图例相关
    this._initLegendConfigInfo(layerInfo, styleGroup);

    let visible = layerInfo.visible;
    let layerStyle = {
      style: this._transformStyleToMapBoxGl(style, type, expression),
      layout: {
        visibility: visible
      }
    };

    let source: mapboxglTypes.GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    };
    this._addOverlayToMap(type, source, layerID, layerStyle);
    type === 'POLYGON' &&
      style.strokeColor &&
      this._addStrokeLineForPoly(style, source, layerID + '-strokeLine', visible);
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
        names.push(name);
      }
    }

    // 获取一定量的颜色
    let curentColors = colors;
    curentColors = SuperMap.ColorsPickerUtil.getGradientColors(curentColors, names.length);

    // 生成styleGroup
    type style = {
      color: string;
      value: string;
    };
    let styleGroup: Array<style> = [];
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
        color: color,
        value: name
      });
    }, this);

    return styleGroup;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getWMTSUrl
   * @description 根据传入的配置信息拼接wmts url。
   * @param options 配置对象
   */
  private _getWMTSUrl(options: any): string {
    let obj = {
      service: 'WMTS',
      request: 'GetTile',
      version: '1.0.0',
      style: 'default',
      layer: options.layer,
      tilematrixSet: options.tileMatrixSet,
      format: 'image/png'
    };
    let url = options.url;

    url += this._getParamString(obj, url) + '&tilematrix={z}&tilerow={y}&tilecol={x}';
    return url;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createMarkerLayer
   * @description 添加标记图层。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createMarkerLayer(layerInfo: any, features: any): void {
    features &&
      features.forEach(feature => {
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

        let source: mapboxglTypes.GeoJSONSourceRaw = {
          type: 'geojson',
          data: feature
        };
        let index = feature.properties.index;
        let layerID = geomType + '-' + index;
        // image-marker
        geomType === 'POINT' &&
          defaultStyle.src &&
          defaultStyle.src.indexOf('svg') <= -1 &&
          this.map.loadImage(defaultStyle.src, (error, image) => {
            if (error) {
              console.log(error);
            }
            this.map.addImage(index + '', image);
            this.map.addLayer({
              id: layerID,
              type: 'symbol',
              source: source,
              layout: {
                'icon-image': index + '',
                'icon-size': defaultStyle.scale,
                visibility: layerInfo.visible
              }
            });
          });

        // svg-marker
        if (geomType === 'POINT' && defaultStyle.src && defaultStyle.src.indexOf('svg') > -1) {
          if (!this._svgDiv) {
            this._svgDiv = document.createElement('div');
            document.body.appendChild(this._svgDiv);
          }
          this._getCanvasFromSVG(defaultStyle.src, this._svgDiv, canvas => {
            let imgUrl = canvas.toDataURL('img/png');
            imgUrl &&
              this.map.loadImage(imgUrl, (error, image) => {
                if (error) {
                  console.log(error);
                }
                this.map.addImage(index + '', image);
                this.map.addLayer({
                  id: layerID,
                  type: 'symbol',
                  source: source,
                  layout: {
                    'icon-image': index + '',
                    'icon-size': defaultStyle.scale,
                    visibility: layerInfo.visible
                  }
                });
              });
          });
        }
        // point-line-polygon-marker
        if (!defaultStyle.src) {
          let layeStyle: any = {
            layout: {}
          };
          if (geomType === 'LINESTRING' && defaultStyle.lineCap) {
            geomType = 'LINE';
            layeStyle.layout = {
              'line-cap': defaultStyle.lineCap
            };
          }
          let visible = layerInfo.visible;
          layeStyle.layout.visibility = visible;
          // get style
          layeStyle.style = this._transformStyleToMapBoxGl(defaultStyle, geomType);
          this._addOverlayToMap(geomType, source, layerID, layeStyle);
          // 若面有边框
          geomType === 'POLYGON' &&
            defaultStyle.strokeColor &&
            this._addStrokeLineForPoly(defaultStyle, source, layerID + '-strokeLine', visible);
        }
      }, this);
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
   * @function WebMapViewModel.prototype._createHeatLayer
   * @description 添加热力图。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createHeatLayer(layerInfo: any, features: any): void {
    let style = layerInfo.themeSetting;
    let layerOption = {
      gradient: style.colors.slice(),
      radius: parseInt(style.radius)
    };

    // 自定义颜色
    let customSettings = style.customSettings;
    for (let i in customSettings) {
      layerOption.gradient[i] = customSettings[i];
    }
    // 权重字段恢复
    if (style.weight) {
      this._changeWeight(features, style.weight);
    }

    let color: string | mapboxglTypes.StyleFunction | mapboxglTypes.Expression = [
      'interpolate',
      ['linear'],
      ['heatmap-density']
    ];

    let length = layerOption.gradient.length;

    let step = parseFloat((1 / length).toFixed(2));
    layerOption.gradient.forEach((item, index) => {
      (<mapboxglTypes.Expression>color).push(index * step);
      if (index === 0) {
        item = mapboxgl.supermap.Util.hexToRgba(item, 0);
      }
      (<mapboxglTypes.Expression>color).push(item);
    });
    // 图例相关
    this._initLegendConfigInfo(layerInfo, layerOption.gradient);

    let paint: mapboxglTypes.HeatmapPaint = {
      'heatmap-color': color,
      'heatmap-radius': style.radius + 15,
      'heatmap-intensity': {
        base: 1,
        stops: [[0, 0.8], [22, 1]]
      }
    };

    if (features[0].weight && features.length >= 4) {
      let weight = [];
      features.forEach(item => {
        weight.push(item.weight);
      });
      let max = SuperMap.ArrayStatistic.getMax(weight);
      let min = SuperMap.ArrayStatistic.getMin(weight);
      paint['heatmap-weight'] = ['interpolate', ['linear'], ['get', 'weight'], min, 0, max, 1];
    }

    this.map.addLayer({
      id: layerInfo.layerID,
      type: 'heatmap',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      },
      paint: paint
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._changeWeight
   * @description 改变当前权重字段
   * @param {Array.<GeoJSON>} features - feature。
   * @param {String} weightFeild - 权重字段
   */
  private _changeWeight(features: any, weightFeild: string): void {
    this._fieldMaxValue = {};
    this._getMaxValue(features, weightFeild);
    let maxValue = this._fieldMaxValue[weightFeild];
    features.forEach(feature => {
      let attributes = feature.properties;
      let value = attributes[weightFeild];
      feature['weight'] = value / maxValue;
    });
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._getMaxValue
   * @description 获取当前字段对应的最大值，用于计算权重。
   * @param {Array.<GeoJSON>} features - feature。
   * @param {String} weightFeild - 权重字段
   */
  private _getMaxValue(features: any, weightField: string): void {
    let values = [];
    let attributes;
    let field = weightField;
    if (this._fieldMaxValue[field]) {
      return;
    }
    features.forEach(feature => {
      // 收集当前权重字段对应的所有值
      attributes = feature.properties;
      attributes && parseFloat(attributes[field]) && values.push(parseFloat(attributes[field]));
    });
    this._fieldMaxValue[field] = SuperMap.ArrayStatistic.getArrayStatistic(values, 'Maximum');
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._createRangeLayer
   * @description 添加分段专题图。
   * @param {Array.<GeoJSON>} features - feature。
   */
  private _createRangeLayer(layerInfo: any, features: any): void {
    let fieldName = layerInfo.themeSetting.themeField;
    let style = layerInfo.style;
    let featureType = layerInfo.featureType;
    let styleGroups = this._getRangeStyleGroup(layerInfo, features);

    features = this._getFiterFeatures(layerInfo.filterCondition, features);

    let source: mapboxglTypes.GeoJSONSourceRaw = {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: features
      }
    };

    // 获取 expression
    let expression = ['match', ['get', 'index']];
    features.forEach(row => {
      let tartget = parseFloat(row.properties[fieldName]);
      if (styleGroups) {
        for (let i = 0; i < styleGroups.length; i++) {
          if (styleGroups[i].start <= tartget && tartget < styleGroups[i].end) {
            expression.push(row.properties['index'], styleGroups[i].color);
          }
        }
      }
      !tartget && expression.push(row.properties['index'], 'rgba(0, 0, 0, 0)');
    }, this);
    expression.push('rgba(0, 0, 0, 0)');

    // 图例处理
    this._initLegendConfigInfo(layerInfo, styleGroups);

    // 获取样式
    let layerStyle: any = {
      layout: {}
    };
    if (featureType === 'LINE' && style.lineCap) {
      layerStyle.layout = {
        'line-cap': style.lineCap
      };
    }
    let visible = layerInfo.visible;
    layerStyle.layout.visibility = visible;
    layerStyle.style = this._transformStyleToMapBoxGl(style, featureType, expression);
    // 添加图层
    let layerID = layerInfo.layerID;
    this._addOverlayToMap(featureType, source, layerID, layerStyle);
    // 如果面有边框
    featureType === 'POLYGON' &&
      style.strokeColor &&
      this._addStrokeLineForPoly(style, source, layerID + '-strokeline', visible);
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
        attributes[fieldName] &&
          mapboxgl.supermap.Util.isNumber(attributes[fieldName]) &&
          values.push(parseFloat(attributes[fieldName]));
      } else if (feature.get(fieldName) && mapboxgl.supermap.Util.isNumber(feature.get(fieldName))) {
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
       * @property {mapboxglTypes.Map} map - MapBoxGL Map 对象。
       * @property {Object} mapparams - 地图信息。
       * @property {string} mapParams.title - 地图标题。
       * @property {string} mapParams.description - 地图描述。
       * @property {Array.<Object>} layers - 地图上所有的图层对象。
       */
      this._sourceListModel = new SourceListModel({
        map: this.map
      });
      for (let layerID in this._legendList) {
        this._sourceListModel.addSourceStyle(layerID, this._legendList[layerID]);
      }
      for (let index = this._layers.length - 2; index > -1; index--) {
        const targetlayerId = this._layers[index].layerID;
        const beforLayerId = this._layers[index + 1].layerID;
        this.map.moveLayer(targetlayerId, beforLayerId);
      }
      this.fire('addlayerssucceeded', {
        map: this.map,
        mapparams: this.mapParams,
        layers: this._layers
      });
    }
  }

  /**
   * @function WebMapViewModel.prototype._unproject
   * @private
   * @description 墨卡托转经纬度。
   * @param {} point - 待转换的点。
   */
  private _unproject(point: [number, number]): [number, number] {
    var d = 180 / Math.PI;
    var r = 6378137;
    var ts = Math.exp(-point[1] / r);
    var phi = Math.PI / 2 - 2 * Math.atan(ts);
    for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
      con = 1;
      dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
      phi += dphi;
    }
    return [(point[0] * d) / r, phi * d];
  }

  /**
   * @function WebMapViewModel.prototype._getParamString
   * @private
   * @param {Object} obj - 待添加的参数。
   * @param {string} existingUrl - 待添加参数的 url。
   * @param {Boolean} [uppercase] - 参数是否转换为大写。
   */
  private _getParamString(obj: any, existingUrl: string, uppercase = false): string {
    var params = [];
    for (var i in obj) {
      params.push((uppercase ? i.toUpperCase() : i) + '=' + obj[i]);
    }
    return (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&');
  }

  /**
   * @private
   * @function WebMapViewModel.prototype._transformStyleToMapBoxGl
   * @description 根据图层类型将 layerInfo 中的 style 属性格式转换为 mapboxglTypes 中的 style 格式。
   * @param {Object} style - layerInfo中的style属性
   * @param {String} type - 图层类型
   * @param {Array} [expression] - 存储颜色值得表达式
   */
  private _transformStyleToMapBoxGl(style: any, type: layerType, expression?, expressionType?): any {
    let transTable = {};
    if ((style.type === 'POINT' || style.type === 'BASIC_POINT' || type === 'POINT') && type !== 'LINE') {
      transTable = {
        fillColor: 'circle-color',
        strokeWidth: 'circle-stroke-width',
        fillOpacity: 'circle-opacity',
        radius: 'circle-radius',
        strokeColor: 'circle-stroke-color',
        strokeOpacity: 'circle-stroke-opacity'
      };
    } else if (['LINE', 'LINESTRING', 'MULTILINESTRING'].includes(type)) {
      transTable = {
        strokeWidth: 'line-width',
        strokeColor: 'line-color',
        strokeOpacity: 'line-opacity'
      };
    } else if (['REGION', 'POLYGON', 'MULTIPOLYGON'].includes(type)) {
      transTable = {
        fillColor: 'fill-color',
        fillOpacity: 'fill-opacity',
        strokeColor: 'fill-outline-color'
      };
    }

    let newObj = {};
    for (let item in style) {
      if (transTable[item]) {
        newObj[transTable[item]] = style[item];
      }
    }
    if (expression) {
      if (expressionType) {
        newObj[expressionType] = expression;
      } else if (newObj['circle-color']) {
        newObj['circle-color'] = expression;
      } else if (newObj['line-color']) {
        newObj['line-color'] = expression;
      } else {
        newObj['fill-color'] = expression;
      }
    }
    if (style.lineDash && style.lineDash !== 'solid' && type === 'LINE') {
      newObj['line-dasharray'] = this._dashStyle(style);
    }
    return newObj;
  }

  /**
   * @private
   * @function WebMapViewModel.prototype.._dashStyle
   * @description 符号样式。
   * @param {Object} style - 样式参数。
   * @param {number} widthFactor - 宽度系数。
   */
  private _dashStyle(style: any): Array<number> {
    if (!style) {
      return [];
    }
    // var w = style.strokeWidth * widthFactor;
    var w = 1;
    var str = style.strokeDashstyle || style.lineDash;
    switch (str) {
      case 'solid':
        return [];
      case 'dot':
        return [1, 4 * w];
      case 'dash':
        return [4 * w, 4 * w];
      case 'dashdot':
        return [4 * w, 4 * w, 1 * w, 4 * w];
      case 'longdash':
        return [8 * w, 4 * w];
      case 'longdashdot':
        return [8 * w, 4 * w, 1, 4 * w];
      default:
        if (!str) {
          return [];
        }
        if (SuperMap.Util.isArray(str)) {
          return str;
        }
        str = SuperMap.String.trim(str).replace(/\s+/g, ',');
        return str.replace(/\[|\]/gi, '').split(',');
    }
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
    canvas.id = 'dataviz-canvas-' + mapboxgl.supermap.Util.newGuid(8);
    canvas.style.display = 'none';
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
   * @function WebMapViewModel.prototype._addOverlayToMap
   * @description 添加基础矢量图层到 MAP
   * @param {Object} style - mabgl style
   * @param {String} type - 图层类型
   */
  private _addOverlayToMap(
    type: layerType,
    source: mapboxglTypes.GeoJSONSourceRaw,
    layerID: string,
    layerStyle: any
  ): void {
    let mbglTypeMap = {
      POINT: 'circle',
      LINE: 'line',
      POLYGON: 'fill'
    };
    let mbglType = mbglTypeMap[type];
    if (mbglType === 'circle' || mbglType === 'line' || mbglType === 'fill') {
      this.map.addLayer({
        id: layerID,
        type: mbglType,
        source: source,
        paint: layerStyle.style,
        layout: layerStyle.layout || {}
      });
    }
  }

  private _addBaselayer(url: Array<string>, layerID: string, minzoom = 0, maxzoom = 22, isIserver = false): void {
    let source: mapboxglTypes.RasterSource = {
      type: 'raster',
      tiles: url,
      tileSize: 256,
      // @ts-ignore
      rasterSource: isIserver ? 'iserver' : ''
    };
    this.map.addLayer({
      id: layerID,
      type: 'raster',
      source: source,
      minzoom: minzoom || 0,
      maxzoom: maxzoom || 22
    });
  }
  /**
   * @private
   * @function WebMapViewModel.prototype._addStrokeLineForPoly
   * @description 添加面的边框。
   * @param {Object} style - mabgl style
   */
  private _addStrokeLineForPoly(style: any, source: any, layerID: string, visible: boolean): void {
    let lineStyle = {
      style: this._transformStyleToMapBoxGl(style, 'LINE'),
      layout: {
        visibility: visible
      }
    };
    this._addOverlayToMap('LINE', source, layerID, lineStyle);
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
    let queryBySQLService = new mapboxgl.supermap.QueryService(url);
    queryBySQLService.queryBySQL(queryBySQLParams, data => {
      data.type === 'processCompleted' ? processCompleted(data) : processFaild(data);
    });
  }

  private _initLegendConfigInfo(layerInfo: any, style: any): void {
    if (!this._legendList[layerInfo.layerID]) {
      this._legendList[layerInfo.layerID] = {
        layerType: layerInfo.layerType,
        featureType: layerInfo.featureType,
        layerId: layerInfo.layerID,
        themeField: layerInfo.layerType === 'HEAT' ? layerInfo.themeSetting.weight : layerInfo.themeSetting.themeField,
        styleGroup: style
      };
    }
  }

  _getFeatureProperties(features) {
    let properties = [];
    if (features && features.length) {
      features.forEach(feature => {
        let property = feature.properties;
        property && properties.push(property);
      });
    }
    return properties;
  }

  _addVectorLayer(info, layerInfo, featureType) {
    let style = this._getDataVectorTileStyle(featureType);
    let paint = this._transformStyleToMapBoxGl(style, featureType);
    let url = info.url + '/tileFeature.mvt';
    let origin = mapboxgl.CRS.get(this.baseProjection).getOrigin();
    url += `?&returnAttributes=true&width=512&height=512&x={x}&y={y}&scale={scale}&origin={x:${origin[0]},y:${
      origin[1]
    }}`;
    this.map.addLayer({
      id: UniqueId(layerInfo.name + '-'),
      // @ts-ignore
      type: style.mbglType,
      source: {
        type: 'vector',
        tiles: [url]
      },
      'source-layer': `${info.datasetName}@${info.datasourceName}`,
      paint,
      layout: {
        visibility: layerInfo.visible ? 'visible' : 'none'
      }
    });
  }

  _isMvt(serviceUrl, datasetName) {
    return this._getDatasetsInfo(serviceUrl, datasetName).then(info => {
      //判断是否和底图坐标系一直
      if (info.epsgCode == this.baseProjection.split('EPSG:')[1]) {
        return SuperMap.FetchRequest.get(`${info.url}/tilefeature.mvt`)
          .then(function(response) {
            return response.json();
          })
          .then(function(result) {
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

  _getDataVectorTileStyle(featureType) {
    let styleParameters = {
      radius: 8, //圆点半径
      fillColor: '#EE4D5A', //填充色
      fillOpacity: 0.9,
      strokeColor: '#ffffff', //边框颜色
      strokeWidth: 1,
      strokeOpacity: 1,
      lineDash: 'solid',
      type: 'BASIC_POINT',
      mbglType: 'circle'
    };
    if (['LINE', 'LINESTRING', 'MULTILINESTRING'].includes(featureType)) {
      styleParameters.strokeColor = '#4CC8A3';
      styleParameters.strokeWidth = 2;
      styleParameters.mbglType = 'line';
    } else if (['REGION', 'POLYGON', 'MULTIPOLYGON'].includes(featureType)) {
      styleParameters.fillColor = '#826DBA';
      styleParameters.mbglType = 'fill';
    }
    return styleParameters;
  }

  _transformFeatures(features) {
    features &&
      features.forEach((feature, index) => {
        let geometryType = feature.geometry.type;
        let coordinates = feature.geometry.coordinates;
        if (geometryType === 'LineString') {
          coordinates.forEach((coordinate, index) => {
            coordinate = this._unproject(coordinate);
            coordinates[index] = coordinate;
          }, this);
        } else if (geometryType === 'Point') {
          coordinates = this._unproject(coordinates);
          feature.geometry.coordinates = coordinates;
        } else if (geometryType === 'MultiPolygon' || geometryType === 'Polygon') {
          coordinates.forEach((coordinate, index) => {
            let coords = geometryType === 'MultiPolygon' ? coordinate[0] : coordinate;
            coords.forEach((latlng, index) => {
              latlng = this._unproject(latlng);
              coords[index] = latlng;
            });
            coordinates[index] = coordinate;
          });
        }
        features[index] = feature;
      }, this);
  }
}
