/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from './SourceListModel';
import { handleMultyPolygon } from '../_utils/geometry-util';
import { isXField, isYField } from '../../common/_utils/util';
import '../../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';
import '../../../static/libs/geostats/geostats';
import * as convert from 'xml-js';
import canvg from 'canvg';
import jsonsql from 'jsonsql';

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

/**
 * @class WebMapViewModel
 * @category ViewModel
 * @classdesc 对接 iPortal/Online 地图类。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @param {number} id - iPortal|Online 地图 ID。
 * @param {Object} options - 参数。
 * @param {string} [options.target='map'] - 地图容器 ID。
 * @param {string} [options.serverUrl="http://www.supermapol.com"] - 地图的地址。
 * @param {string} [options.accessToken] - SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。
 * @param {string} [options.accessKey] - accessKey 用于访问 iPortal 中受保护的服务。
 * @param {boolean} [options.withCredentials=false] - 请求是否携带 cookie。
 * @param {boolean} [options.excludePortalProxyUrl] - server 传递过来的 URL 是否带有代理。
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
}

type layerType = 'POINT' | 'LINE' | 'POLYGON';

export default class WebMapViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  mapId: string;

  mapOptions: any;

  serverUrl: string;

  accessToken: string;

  accessKey: string;

  withCredentials: boolean;

  target: string;

  excludePortalProxyUrl: boolean;

  center: number[];

  zoom: number;

  mapParams: { title?: string; description?: string };

  baseProjection: string;

  on: any;

  fire: any;

  private _sourceListModel: SourceListModel;

  private _legendList: any;

  private _layers: any;

  private _svgDiv: HTMLElement;

  private _fieldMaxValue: any;

  private _taskID: Date;

  private layerAdded: number;

  constructor(id, options: webMapOptions = {}, mapOptions: any = { version: 8, sources: {}, layers: [] }) {
    super();
    this.mapId = id;
    this.mapOptions = mapOptions;
    this.serverUrl = options.serverUrl || 'http://www.supermapol.com';
    this.accessToken = options.accessToken;
    this.accessKey = options.accessKey;
    this.withCredentials = options.withCredentials || false;
    this.target = options.target || 'map';
    this.excludePortalProxyUrl = options.excludePortalProxyUrl;
    this.center = mapOptions.center || [];
    this.zoom = mapOptions.zoom;
    this._createWebMap();
  }
  /**
   * @function WebMapViewModel.prototype.resize
   * @description Map 更新大小。
   */
  resize(): void {
    this.map && this.map.resize();
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
    // this._createWebMap();
  }

  setWithCredentials(withCredentials) {
    this.withCredentials = withCredentials;
  }
  /**
   * @function WebMapViewModel.prototype.setMapOptions
   * @description 设置 Map 基本配置参数。
   * @param {Object} mapOptions - Map 可选参数。
   * @param {Array} [mapOptions.center] - 地图中心点。
   * @param {Number} [mapOptions.zoom] - 地图缩放级别。
   * @param {Array} [mapOptions.maxBounds] - 地图最大范围。
   * @param {Number} [mapOptions.minZoom] - 地图最小级别。
   * @param {Number} [mapOptions.maxZoom] - 地图最大级别。
   * @param {Boolean} [mapOptions.renderWorldCopies] - 地图是否平铺。
   * @param {Number} [mapOptions.bearing] - 地图的初始方位。
   * @param {Number} [mapOptions.pitch] - 地图的初始俯仰。
   */
  setMapOptions(mapOptions: mapOptions): void {
    let { center, zoom, maxBounds, minZoom, maxZoom, renderWorldCopies, bearing, pitch } = mapOptions;
    if (this.map) {
      center && (<[number, number]>center).length > 0 && this.map.setCenter(center);
      (zoom || zoom === 0) && this.map.setZoom(zoom);
      maxBounds && (<[[number, number], [number, number]]>maxBounds).length > 0 && this.map.setMaxBounds(maxBounds);
      (minZoom || minZoom === 0) && this.map.setMinZoom(minZoom);
      (maxZoom || maxZoom === 0) && this.map.setMaxZoom(maxZoom);
      renderWorldCopies && this.map.setRenderWorldCopies(renderWorldCopies);
      (bearing || bearing === 0) && this.map.setBearing(bearing);
      (pitch || pitch === 0) && this.map.setPitch(pitch);
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
    }
    if (!this.mapId || !this.serverUrl) {
      this.mapOptions.container = this.target;
      this.map = new mapboxgl.Map(this.mapOptions);
      this.map.on('load', () => {
        this.fire('addlayerssucceeded', {
          map: this.map,
          mapparams: {},
          layers: []
        });
      });
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
    type coordinateObj = { x: number; y: number };
    let center: number[] | coordinateObj | mapboxglTypes.LngLat;
    center = mapInfo.center;

    // center
    let zoom = mapInfo.level || 0;
    zoom = zoom === 0 ? 0 : zoom - 1;

    if (!center) {
      center = [0, 0];
    }
    if (this.baseProjection === 'EPSG:3857') {
      center = this._unproject([(<coordinateObj>center).x, (<coordinateObj>center).y]);
    }

    center = new mapboxgl.LngLat((<coordinateObj>center).x, (<coordinateObj>center).y);

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
      renderWorldCopies: false
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
        const projectionMap = {
          'EPSG:4490': 'EPSG:4490',
          'EPSG:4214': 'EPSG:4214',
          'EPSG:4610': 'EPSG:4610',
          'EPSG:3857': 'EPSG:3857',
          'EPSG:4326': 'EPSG:4326'
        };
        // 坐标系异常处理
        if (this.baseProjection in projectionMap) {
          this._createMap(mapInfo);

          let layers = mapInfo.layers;

          this.map.on('load', () => {
            this._addBaseMap(mapInfo);
            if (!layers || layers.length === 0) {
              this._sendMapToUser(0, 0);
            } else {
              this._addLayers(layers, _taskID);
            }
          });
        } else {
          throw Error('不支持当前地图的坐标系');
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
                throw Error('不支持传入的 TileMatrixSet');
              }
            } else {
              throw Error('不支持传入的 TileMatrixSet');
            }
          }
        }
        matchedCallback(isMatched, matchMaxZoom);
      })
      .catch(error => {
        /**
         * @event WebMapViewModel#getwmtsinfofailed
         * @description 获取 WMTS 图层信息失败。
         * @property {Object} error - 失败原因。
         * @property {mapboxglTypes.Map} map - MapBoxGL Map 对象。
         */
        this.fire('getwmtsinfofailed', {
          error: error,
          map: this.map
        });
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
    let url = layerInfo.url + '/zxyTileImage.png?z={z}&x={x}&y={y}';
    // @ts-ignore -------- setCRS 为 enhance 新加属性
    if (this.map.setCRS && this.baseProjection !== 'EPSG:3857') {
      url = layerInfo.url + '/image.png?viewBounds={viewBounds}&width={width}&height={height}';
    }
    this._addBaselayer([url], 'tile-layers-' + layerInfo.name);
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
    let tiandituUrls: { tiandituUrl: urlArr; labelUrl: urlArr };

    let layerType = mapInfo.baseLayer.layerType.split('_')[1].toLowerCase();
    let isLabel = Boolean(mapInfo.baseLayer.labelLayerVisible);

    let url = 'http://t0.tianditu.com/{layer}_{proj}/wmts?';
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

  _getServiceInfoFromLayer(layerIndex, len, layer, dataItemServices, datasetName, featureType, accessType, info?: any) {
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
      else if (accessType !== service.serviceType) {
        return;
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
                      // TODO !! 需要判断是使用tile还是mvt服务
                      this._getServiceInfoFromLayer(
                        index,
                        len,
                        layer,
                        dataItemServices,
                        datasetName,
                        featureType,
                        dataSource.accessType === 'REST_DATA' ? 'RESTDATA' : 'RESTMAP'
                      );
                    } else {
                      this._getServiceInfoFromLayer(
                        index,
                        len,
                        layer,
                        dataItemServices,
                        datasetName,
                        featureType,
                        dataSource.accessType === 'REST_DATA' ? 'RESTDATA' : 'RESTMAP'
                      );
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
        } // TODO  待对接 DataFlow!
        else if (layer.layerType === 'DATAFLOW_POINT_TRACK' || layer.layerType === 'DATAFLOW_HEAT') {
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
    if (features[0] && features[0].geometry.type === 'Polygon') {
      features = handleMultyPolygon(features);
    }

    if (layerInfo.style && layerInfo.filterCondition) {
      // 将 feature 根据过滤条件进行过滤, 分段专题图和单值专题图因为要计算 styleGroup 所以暂时不过滤
      if (layerType !== 'RANGE' && layerType !== 'UNIQUE') {
        features = this._getFiterFeatures(layerInfo.filterCondition, features);
      }
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
    }
    if (layerInfo.labelStyle && layerInfo.labelStyle.labelField) {
      // 存在标签专题图
      this._addLabelLayer(layerInfo, features);
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
        'text-color': labelStyle.fill
      },
      layout: {
        'text-field': `{${labelStyle.labelField}}`,
        'text-size': parseFloat(labelStyle.fontSize) || 12,
        'text-offset': labelStyle.offsetX ? [labelStyle.offsetX / 10 || 0, labelStyle.offsetY / 10 || 0] : [0, -1.5],
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
  private _createSymbolLayer(layerInfo: any, features: any): void {
    // 用来请求symbol_point字体文件
    let target = document.getElementById(`${this.target}`);
    target.classList.add('supermapol-icons-map');

    let style = layerInfo.style;
    let unicode = layerInfo.style.unicode;
    let text = String.fromCharCode(parseInt(unicode.replace(/^&#x/, ''), 16));
    let layerID = layerInfo.layerID;
    this.map.addSource(layerID + '-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    this.map.addLayer({
      id: layerID,
      type: 'symbol',
      source: layerID + '-source',
      paint: {
        'text-color': style.fillColor
      },
      layout: {
        'text-field': text,
        'text-font': ['DIN Offc Pro Italic', 'Arial Unicode MS Regular'],
        visibility: layerInfo.visible
      }
    });
    // @ts-ignore
    this.map.getSource(layerID + '-source').setData({
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
  private _createGraphicLayer(layerInfo: any, features: any) {
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
      let imgDom = imageInfo.img;
      if (!imgDom || !imgDom.src) {
        // 要组装成完整的url
        imageInfo.url = this.serverUrl + imageInfo.url;
      }
      this.map.loadImage(imageInfo.url || imgDom.src, (error, image) => {
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
            'icon-size': iconSize,
            visibility: layerInfo.visible
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
                'icon-size': iconSize,
                visibility: layerInfo.visible
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
    let jsonsqls = jsonsql || window.jsonsql;
    let condition = this._replaceFilterCharacter(filterCondition);
    let sql = 'select * from json where (' + condition + ')';
    let filterFeatures = [];
    for (let i = 0; i < allFeatures.length; i++) {
      let feature = allFeatures[i];
      let filterResult: any;
      try {
        filterResult = jsonsqls.query(sql, {
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
      // TODO 待优化 坐标转换
      // if (fileCode !== 'EPSG:4326') {
      //     if(row.geometry.coordinates[0] instanceof Array){
      //         row.geometry.coordinates.forEach((coords, index) => {
      //             let lnglat = this._unproject(coords);
      //             row.geometry.coordinates[index] = [lnglat.lng, lnglat.lat];
      //         }, this)
      //         return;
      //     }
      //     let lnglat = this._unproject(row.geometry.coordinates);
      //     row.geometry.coordinates = [lnglat.lng, lnglat.lat];
      // }
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
    // let fileCode = layerInfo.projection;
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
      // let coordinates = [x, y];
      // TODO 待优化 坐标转换
      // if (fileCode !== 'EPSG:4326') {
      //     if(row.geometry.coordinates[0] instanceof Array){
      //         row.geometry.coordinates.forEach((coords, index) => {
      //             let lnglat = this._unproject(coords);
      //             row.geometry.coordinates[index] = [lnglat.lng, lnglat.lat];
      //         }, this)
      //         return;
      //     }
      //     let lnglat = this._unproject(row.geometry.coordinates);
      //     row.geometry.coordinates = [lnglat.lng, lnglat.lat];
      // }

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
  private _unproject(point: Array<number>): { x: number; y: number } {
    var d = 180 / Math.PI;
    var r = 6378137;
    var ts = Math.exp(-point[1] / r);
    var phi = Math.PI / 2 - 2 * Math.atan(ts);
    for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
      con = 1;
      dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
      phi += dphi;
    }
    return {
      x: (point[0] * d) / r,
      y: phi * d
    };
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
  private _transformStyleToMapBoxGl(style: any, type: layerType, expression?): any {
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
    } else if (type === 'LINE') {
      transTable = {
        strokeWidth: 'line-width',
        strokeColor: 'line-color',
        strokeOpacity: 'line-opacity'
      };
    } else if (type === 'POLYGON') {
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
      if (newObj['circle-color']) {
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

  private _addBaselayer(url: Array<string>, layerID: string, minzoom = 0, maxzoom = 22): void {
    let source: mapboxglTypes.RasterSource = {
      type: 'raster',
      tiles: url,
      tileSize: 256
    };
    this.map.addLayer({
      id: layerID,
      type: 'raster',
      source: source,
      minzoom: minzoom,
      maxzoom: maxzoom
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
      // TODO 坐标转换
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
      toIndex: 100000,
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
}
