/* Copyright© 2000 - 2019 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from './SourceListModel';
import { handleMultyPolygon } from '../_utils/geometry-util';
import '../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import '../../../static/libs/geostats/geostats';
import '../../../static/libs/json-sql/jsonsql';
import echarts from 'echarts';
import EchartsLayer from '../../../static/libs/echarts-layer/EchartsLayer';
import cloneDeep from 'lodash.clonedeep';
import { geti18n } from '../../common/_lang';
import WebMapBase from '../../common/web-map/WebMapBase';
import proj4 from 'proj4';

// 迁徙图最大支持要素数量
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
  isSuperMapOnline?: boolean;
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

export default class WebMapViewModel extends WebMapBase {
  map: mapboxglTypes.Map;

  center: [number, number] | mapboxglTypes.LngLatLike | { lon: number; lat: number };

  bearing: number;

  pitch: number;

  layerFilter: Function;

  private _sourceListModel: SourceListModel;

  private _legendList: any;

  private _fieldMaxValue: any;

  private _handleDataflowFeaturesCallback: Function;

  private _dataflowService: any;

  private _unprojectProjection: string;

  private _cacheLayerId: Array<string> = [];

  constructor(
    id,
    options: webMapOptions = {},
    // @ts-ignore fix-mapoptions
    mapOptions: mapOptions = { style: { version: 8, sources: {}, layers: [] } },
    map?: mapboxglTypes.Map,
    layerFilter: Function = function() { return true }
  ) {
    super(id, options, mapOptions);
    this.mapId = id;
    if (!this.mapId && !mapOptions.center && !mapOptions.zoom) {
      mapOptions.center = [0, 0];
      mapOptions.zoom = 0;
    }
    if (this.centerValid(mapOptions.center)) {
      this.center = mapOptions.center;
    }
    this.zoom = mapOptions.zoom;
    this.bearing = mapOptions.bearing;
    this.pitch = mapOptions.pitch;
    this.layerFilter = layerFilter;
    this._legendList = {};
    if (map) {
      this.map = map;
      this._taskID = new Date();
      this.getMapInfo(this._taskID);
    }else{
      this._initWebMap();
    }
  }

  public resize(): void {
    this.map && this.map.resize();
    this.echartsLayerResize();
  }

  public setCrs(crs): void {
    if (this.map) {
      this.mapOptions.crs = crs;
      //@ts-ignore
      crs && this.map.setCRS(mapboxgl.CRS.get(crs));
    }
  }

  public setCenter(center): void {
    if (this.map && this.centerValid(center)) {
      this.mapOptions.center = center;
      this.map.setCenter(center);
    }
  }

  public setRenderWorldCopies(renderWorldCopies): void {
    if (this.map) {
      this.mapOptions.renderWorldCopies = renderWorldCopies;
      renderWorldCopies && this.map.setRenderWorldCopies(renderWorldCopies);
    }
  }

  public setBearing(bearing): void {
    if (this.map) {
      this.mapOptions.bearing = bearing;
      (bearing || bearing === 0) && this.map.setBearing(bearing);
    }
  }

  public setPitch(pitch): void {
    if (this.map) {
      this.mapOptions.pitch = pitch;
      (pitch || pitch === 0) && this.map.setPitch(pitch);
    }
  }

  public setStyle(style): void {
    if (this.map) {
      this.mapOptions.style = style;
      style && this.map.setStyle(style);
    }
  }

  protected cleanLayers() {
    this._taskID = null;
    this._cacheLayerId.forEach(layerId => {
      if (this.map && this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });
    this._cacheLayerId.forEach(layerId => {
      if (this.map && this.map.getSource(layerId)) {
        this.map.removeSource(layerId);
      }
    });
    this._cacheLayerId = [];
  }

  get getSourceListModel(): SourceListModel {
    return this._sourceListModel;
  }

  _initWebMap(): void {
    this.initWebMap();
  }

  _getMapInfo(mapInfo, _taskID): void {
    let { projection } = mapInfo;
    let epsgCode = projection.split(':')[1];
    if (!epsgCode) {
      this.baseProjection = this.getEpsgInfoFromWKT(projection);
    } else {
      this.baseProjection = projection;
    }

    if (mapboxgl.CRS.get(this.baseProjection)) {
      if (!['EPSG:4326', 'EPSG:3857'].includes(this.baseProjection)) {
        this._defineProj4(this.baseProjection.split(':')[1]);
      }

      if (this.map) {
        // @ts-ignore
        if (this.map.getCRS().epsgCode !== this.baseProjection) {
          this.triggerEvent('projectionIsNotMatch', {});
          return;
        }
        this._handleLayerInfo(mapInfo, _taskID);
      } else {
        this._createMap(mapInfo);
        this.map.on('load', () => {
          this._handleLayerInfo(mapInfo, _taskID);
        });
      }
    } else {
      throw Error(geti18n().t('webmap.crsNotSupport'));
    }
  }

  _handleLayerInfo(mapInfo, _taskID): void {
    mapInfo = this._setLayerID(mapInfo);
    const { layers, baseLayer} = mapInfo;

    typeof this.layerFilter === 'function' && this.layerFilter(baseLayer)  && this._initBaseLayer(mapInfo);
    if (!layers || layers.length === 0) {
      this._sendMapToUser(0, 0);
    } else {
      this._initOverlayLayers(layers, _taskID);
    }
  }

  _createMap(mapInfo?): void {
    if (!mapInfo) {
      this.mapOptions.container = this.target;
      setTimeout(() => {
        this.map = new mapboxgl.Map(this.mapOptions);
        this.map.on('load', () => {
          this.triggerEvent('addlayerssucceeded', {
            map: this.map,
            mapparams: {},
            layers: []
          });
        });
      }, 0);

      return;
    }
    // 获取字体样式
    let fontFamilys: string = this._getLabelFontFamily(mapInfo);
    let center = this._getMapCenter(mapInfo);
    // zoom
    let zoom = mapInfo.level || 0;
    // @ts-ignore
    const zoomBase = +Math.log2(
      this._getResolution(mapboxgl.CRS.get(this.baseProjection).getExtent()) / this._getResolution(mapInfo.extent)
    ).toFixed(2);
    zoom += zoomBase;
    // 初始化 map
    this.map = new mapboxgl.Map({
      container: this.target,
      center: this.center || center,
      zoom: this.zoom || zoom,
      bearing: this.bearing || 0,
      pitch: this.pitch || 0,
      style: {
        version: 8,
        sources: {},
        layers: []
      },
      // @ts-ignore fix-crs
      crs: this.baseProjection,
      localIdeographFontFamily: fontFamilys || '',
      renderWorldCopies: false,
      preserveDrawingBuffer: this.mapOptions.preserveDrawingBuffer || false,
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Tile' && this.isSuperMapOnline && url.indexOf('http://') === 0) {
          url = `https://www.supermapol.com/apps/viewer/getUrlResource.png?url=${encodeURIComponent(url)}`;
        }
        return {
          url: url
        };
      }
    });
    /**
     * @description Map 初始化成功。
     */
    this.triggerEvent('mapinitialized', { map: this.map });
  }

  private _createMVTBaseLayer(layerInfo) {
    let url = layerInfo.dataSource.url;
    // @ts-ignore
    this.map.addStyle(url);
  }

  _initBaseLayer(mapInfo: any): void {
    let layerInfo = mapInfo.baseLayer || mapInfo;
    let layerType = this.getBaseLayerType(layerInfo);
    let mapUrls = this.getMapurls();
    let url: string;

    switch (layerType) {
      case 'TIANDITU':
        this._createTiandituLayer(mapInfo);
        break;
      case 'BING':
        this._createBingLayer(layerInfo.layerID || layerInfo.name);
        break;
      case 'WMS':
        this._createWMSLayer(layerInfo);
        break;
      case 'WMTS':
        this._createWMTSLayer(layerInfo);
        break;
      case 'TILE':
        this._createDynamicTiledLayer(layerInfo);
        break;
      case 'CLOUD':
      case 'XYZ':
        url = mapUrls[layerInfo.layerType];
        this._createXYZLayer(layerInfo, url);
        break;
      case 'BAIDU':
        this.triggerEvent('notsupportbaidumap', {});
        break;
      case 'MAPBOXSTYLE':
        this._createMVTBaseLayer(layerInfo); // 添加矢量瓦片服务作为底图
      default:
        break;
    }
  }

  _initOverlayLayers(layers: any, _taskID): void {
    // 存储地图上所有的图层对象
    if(typeof this.layerFilter === 'function') {
      layers = layers.filter(this.layerFilter);
    }
    this._layers = layers;
    this.layerAdded = 0;
    this.expectLayerLen = layers.length;
    if (this.expectLayerLen > 0) {
      layers.forEach((layer, index) => {
        let type = this.webMapService.getDatasourceType(layer);
        // TODO  ---  暂不支持 SAMPLE_DATA
        if (type === 'SAMPLE_DATA') {
          this._addLayerSucceeded();
          this.triggerEvent('getlayerdatasourcefailed', {
            error: 'SAMPLE DATA is not supported',
            layer,
            map: this.map
          });
          return;
        }
        if (type === 'tile') {
          this._initBaseLayer(layer);
          this._addLayerSucceeded();
        } else {
          this.getLayerFeatures(layer, _taskID, type);
        }
      }, this);
    }
  }

  _initOverlayLayer(layerInfo: any, features?: any) {
    let { layerType, visible, style, featureType, labelStyle, projection } = layerInfo;
    layerInfo.visible = visible ? 'visible' : 'none';
    if (layerType === 'restMap') {
      this._createRestMapLayer(features, layerInfo);
      return;
    }
    if (layerType === 'mvt') {
      this._createMvtLayer(features.info, layerInfo, features.featureType);
      return;
    }

    // mbgl 目前不能处理 geojson 复杂面情况
    // mbgl isssue https://github.com/mapbox/mapbox-gl-js/issues/7023
    if (features && features[0] && features[0].geometry.type === 'Polygon') {
      features = handleMultyPolygon(features);
    }

    if (features && projection && (projection !== this.baseProjection || projection === 'EPSG:3857')) {
      let epsgCode = projection.split(':')[1];
      if (!epsgCode) {
        return;
      }
      this._unprojectProjection = projection;

      if (projection !== 'EPSG:3857') {
        this._defineProj4(epsgCode);
      }

      features = this.transformFeatures(features);
    }

    this.handleLayerFeatures(features, layerInfo);

    if (layerType === 'VECTOR') {
      if (featureType === 'POINT') {
        if (style.type === 'SYMBOL_POINT') {
          this._createSymbolLayer(layerInfo, features);
        } else {
          this._createGraphicLayer(layerInfo, features);
        }
      } else {
        // 线和面
        this._createVectorLayer(layerInfo, features);
        // 不在 _createVectorLayer 里面处理 layerAdded++ 的原因：_createDataflowLayer 也调用了_createVectorLayer ，会导致layerAdded > expectLayerLen
        this._addLayerSucceeded();
      }
    } else if (layerType === 'UNIQUE') {
      this._createUniqueLayer(layerInfo, features);
    } else if (layerType === 'RANGE') {
      this._createRangeLayer(layerInfo, features);
    } else if (layerType === 'HEAT') {
      this._createHeatLayer(layerInfo, features);
    } else if (layerType === 'MARKER') {
      this._createMarkerLayer(layerInfo, features);
    } else if (layerType === 'MIGRATION') {
      this._createMigrationLayer(layerInfo, features);
    } else if (layerType === 'RANK_SYMBOL') {
      this._createRankSymbolLayer(layerInfo, features);
    } else if (layerType === 'DATAFLOW_POINT_TRACK' || layerType === 'DATAFLOW_HEAT') {
      this._createDataflowLayer(layerInfo);
    }
    if (labelStyle && labelStyle.labelField && layerType !== 'DATAFLOW_POINT_TRACK') {
      // 存在标签专题图
      this._addLabelLayer(layerInfo, features);
    }
  }

  private _createTiandituLayer(mapInfo: any): void {
    let tiandituUrls = this._getTiandituUrl(mapInfo);
    let { labelLayerVisible, name, visible } = mapInfo.baseLayer;
    let isLabel = Boolean(labelLayerVisible);
    let labelUrl = tiandituUrls['labelUrl'];
    let tiandituUrl = tiandituUrls['tiandituUrl'];
    this._addBaselayer(tiandituUrl, name, visible);
    isLabel && this._addBaselayer(labelUrl, `${name}-label`, visible);
  }

  private _createWMTSLayer(layerInfo): void {
    let wmtsUrl = this._getWMTSUrl(layerInfo);
    this.webMapService
      .getWmtsInfo(layerInfo)
      .then(
        (result: any) => {
          const layerId = layerInfo.layerID || layerInfo.name;
          result.isMatched && this._addBaselayer([wmtsUrl], layerId, layerInfo.visible, 0, result.matchMaxZoom);
        },
        error => {
          throw new Error(error);
        }
      )
      .catch(error => {
        /**
         * @event WebMapViewModel#getmapinfofailed
         * @description 获取地图信息失败。
         * @property {Object} error - 失败原因。
         */
        this.triggerEvent('getmapinfofailed', { error });
      });
  }

  private _createBingLayer(layerName: string): void {
    let bingUrl =
      'http://dynamic.t0.tiles.ditu.live.com/comp/ch/{quadkey}?it=G,TW,L,LA&mkt=zh-cn&og=109&cstl=w4c&ur=CN&n=z';
    // @ts-ignore
    this._addBaselayer([bingUrl], layerName, layerInfo.visible);
  }

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
    const layerId = layerInfo.layerID || layerInfo.name;
    this._addBaselayer(urlArr, layerId, layerInfo.visible);
  }

  private _createDynamicTiledLayer(layerInfo: any): void {
    let url = layerInfo.url;
    const layerId = layerInfo.layerID || layerInfo.name;
    this._addBaselayer([url], layerId, layerInfo.visible, null, null, true);
  }

  private _createWMSLayer(layerInfo: any): void {
    let WMSUrl = this._getWMSUrl(layerInfo);
    const layerId = layerInfo.layerID || layerInfo.name;
    this._addBaselayer([WMSUrl], layerId, layerInfo.visible);
  }

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
      this._addStrokeLineForPoly(style, layerID, layerID + '-strokeLine', visible);
  }

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

  private _setLayerID(mapInfo): Array<object> {
    let sumInfo: object = {};
    const { baseLayer, layers } = mapInfo;
    let baseInfo = this._generateUniqueLayerId(baseLayer.name, 0);
    baseLayer.name = baseInfo.newId;
    const layerNames = layers.map(layer => layer.name);
    const _layers: Array<object> = layers.map((layer, index) => {
      if (!(layer.name in sumInfo)) {
        sumInfo[layer.name] = baseLayer.name === layer.name ? 1 : 0;
      }
      const matchFirstIndex = layerNames.indexOf(layer.name);
      const matchLastIndex = layerNames.lastIndexOf(layer.name);
      if (index > matchFirstIndex && index <= matchLastIndex) {
        sumInfo[layer.name] = sumInfo[layer.name] + 1;
      }
      let layerID = !!sumInfo[layer.name] ? `${layer.name}-${sumInfo[layer.name]}` : layer.name;
      let { newId, newIndex } = this._generateUniqueLayerId(layerID, sumInfo[layer.name]);
      sumInfo[layer.name] = newIndex;
      layerID = newId;
      return Object.assign(layer, { layerID });
    });
    mapInfo.layers = _layers;
    mapInfo.baseLayer = baseLayer;
    return mapInfo;
  }

  private _generateUniqueLayerId(newId, index) {
    if (this.map.getLayer(newId)) {
      index++;
      // 判断是否带有-index后缀
      if (newId.match(/-\d+&/gi)) {
        newId = newId.replace(/\d+$/gi, index);
      } else {
        newId = `${newId}-${index}`;
      }
      return this._generateUniqueLayerId(newId, index);
    } else {
      return { newId, newIndex: index };
    }
  }

  _createRestMapLayer(restMaps, layer) {
    restMaps.forEach(restMapInfo => {
      layer = this.getRestMapLayerInfo(restMapInfo, layer);
      this._initBaseLayer(layer);
    });
    this._addLayerSucceeded();
  }

  _addLayerSucceeded() {
    this.layerAdded++;
    this._sendMapToUser(this.layerAdded, this.expectLayerLen);
  }

  private _createDataflowLayer(layerInfo) {
    let dataflowService = new mapboxgl.supermap.DataFlowService(layerInfo.wsUrl).initSubscribe();
    this._handleDataflowFeaturesCallback = this._handleDataflowFeatures.bind(this, layerInfo);
    dataflowService.on('messageSucceeded', this._handleDataflowFeaturesCallback);
    this._dataflowService = dataflowService;
  }

  private _handleDataflowFeatures(layerInfo, e) {
    let features = JSON.parse(e.data);
    // this.transformFeatures([features]); // TODO 坐标系
    this.triggerEvent('dataflowfeatureupdated', {
      features,
      identifyField: layerInfo.identifyField,
      layerID: layerInfo.layerID
    });
    if (layerInfo.filterCondition) {
      //过滤条件
      let condition = this.replaceFilterCharacter(layerInfo.filterCondition);
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
        if (!this.map.getSource(layerID + '-label')) {
          this._addLabelLayer(layerInfo, [feature]);
        } else {
          this._updateDataFlowFeature(layerID + '-label', feature, layerInfo);
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

  private _createMigrationLayer(layerInfo, features) {
    window['echarts'] = echarts;
    let options = this.getEchartsLayerOptions(layerInfo, features, 'GLMap');
    options['GLMap'] = { roam: true };
    let echartslayer = new EchartsLayer(this.map);
    echartslayer.chart.setOption(options);
    this.echartslayer.push(echartslayer);
    this._addLayerSucceeded();
  }

  private _createRankSymbolLayer(layerInfo, features) {
    let fieldName = layerInfo.themeSetting.themeField;
    let style = layerInfo.style;
    let featureType = layerInfo.featureType;
    let styleSource: any = this.createRankStyleSource(layerInfo, features);
    let styleGroups = styleSource.styleGroups;
    features = this.getFiterFeatures(layerInfo.filterCondition, features);
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

    // 图例处理
    this._initLegendConfigInfo(layerInfo, styleGroups);

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
      this._addLayerSucceeded();
    }
  }

  private _addLabelLayer(layerInfo: any, features: any): void {
    let labelStyle = layerInfo.labelStyle;
    this._addLayer({
      id: `${layerInfo.layerID}-label`,
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

  private _createSymbolLayer(layerInfo: any, features: any, textSize?, textRotateExpresion?): void {
    // 用来请求symbol_point字体文件
    let target = document.getElementById(`${this.target}`);
    target.classList.add('supermapol-icons-map');

    let style = layerInfo.style;
    let unicode = layerInfo.style.unicode;
    let text = String.fromCharCode(parseInt(unicode.replace(/^&#x/, ''), 16));
    let layerID = layerInfo.layerID;
    this._addLayer({
      id: layerID,
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      },
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
    this._addLayerSucceeded();
  }

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
          console.error(error);
          return;
        }
        let iconSize = Number.parseFloat((style.radius / image.height).toFixed(2)) * 2;
        !this.map.hasImage('imageIcon') && this.map.addImage('imageIcon', image);
        this._addLayer({
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
        this._addLayerSucceeded();
      });
    } else if (style.type === 'SVG_POINT') {
      let svgUrl = style.url;
      if (!this._svgDiv) {
        this._svgDiv = document.createElement('div');
        document.body.appendChild(this._svgDiv);
      }
      this.getCanvasFromSVG(svgUrl, this._svgDiv, canvas => {
        this.handleSvgColor(style, canvas);
        let imgUrl = canvas.toDataURL('img/png');
        imgUrl &&
          this.map.loadImage(imgUrl, (error, image) => {
            if (error) {
              console.log(error);
            }
            let iconSize = Number.parseFloat((style.radius / canvas.width).toFixed(2));
            !this.map.hasImage('imageIcon') && this.map.addImage('imageIcon', image);
            this._addLayer({
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
            this._addLayerSucceeded();
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
      this._addLayerSucceeded();
    }
  }

  private _createUniqueLayer(layerInfo: any, features: any): void {
    let styleGroup = this.getUniqueStyleGroup(layerInfo, features);
    features = this.getFiterFeatures(layerInfo.filterCondition, features);

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
      this._addStrokeLineForPoly(style, layerID, layerID + '-strokeLine', visible);
    this._addLayerSucceeded();
  }

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

  private _createMarkerLayer(layerInfo: any, features: any): void {
    const promises =
      features &&
      features.map(feature => {
        return new Promise((resolve, reject) => {
          let geomType = feature.geometry.type.toUpperCase();
          let defaultStyle = feature.dv_v5_markerStyle;
          if (geomType === 'POINT' && defaultStyle.text) {
            // 说明是文字的feature类型
            geomType = 'TEXT';
          }
          let featureInfo = this.setFeatureInfo(feature);
          feature.properties['useStyle'] = defaultStyle;
          feature.properties['featureInfo'] = featureInfo;
          if (
            geomType === 'POINT' &&
            defaultStyle.src &&
            defaultStyle.src.indexOf('http://') === -1 &&
            defaultStyle.src.indexOf('https://') === -1
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
                reject();
              }
              this.map.addImage(index + '', image);
              this._addLayer({
                id: layerID,
                type: 'symbol',
                source: source,
                layout: {
                  'icon-image': index + '',
                  'icon-size': defaultStyle.scale,
                  visibility: layerInfo.visible
                }
              });
              resolve();
            });

          // svg-marker
          if (geomType === 'POINT' && defaultStyle.src && defaultStyle.src.indexOf('svg') > -1) {
            if (!this._svgDiv) {
              this._svgDiv = document.createElement('div');
              document.body.appendChild(this._svgDiv);
            }
            this.getCanvasFromSVG(defaultStyle.src, this._svgDiv, canvas => {
              this.handleSvgColor(defaultStyle, canvas);
              let imgUrl = canvas.toDataURL('img/png');
              imgUrl &&
                this.map.loadImage(imgUrl, (error, image) => {
                  if (error) {
                    console.log(error);
                    reject();
                  }
                  this.map.addImage(index + '', image);
                  this._addLayer({
                    id: layerID,
                    type: 'symbol',
                    source: source,
                    layout: {
                      'icon-image': index + '',
                      'icon-size': defaultStyle.scale,
                      visibility: layerInfo.visible
                    }
                  });
                  resolve();
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
              this._addStrokeLineForPoly(defaultStyle, layerID, layerID + '-strokeLine', visible);

            resolve();
          }
        });
      });
    if (promises) {
      Promise.all(promises).then(() => {
        this._addLayerSucceeded();
      });
    }
  }

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
        stops: [
          [0, 0.8],
          [22, 1]
        ]
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
    this._addLayer({
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
    this._addLayerSucceeded();
  }

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

  private _createRangeLayer(layerInfo: any, features: any): void {
    let fieldName = layerInfo.themeSetting.themeField;
    let style = layerInfo.style;
    let featureType = layerInfo.featureType;
    let styleGroups = this.getRangeStyleGroup(layerInfo, features);

    features = this.getFiterFeatures(layerInfo.filterCondition, features);

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
      if (!tartget && tartget !== 0) {
        expression.push(row.properties['index'], 'rgba(0, 0, 0, 0)');
        return;
      }
      if (styleGroups) {
        for (let i = 0; i < styleGroups.length; i++) {
          if (styleGroups[i].start <= tartget && tartget < styleGroups[i].end) {
            expression.push(row.properties['index'], styleGroups[i].color);
          }
        }
      }
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
      this._addStrokeLineForPoly(style, layerID, layerID + '-strokeline', visible);
    this._addLayerSucceeded();
  }

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

      const exsitLayers = this._layers.filter(layer => !!this.map.getLayer(layer.layerID));
      for (let index = exsitLayers.length - 2; index > -1; index--) {
        const targetlayerId = exsitLayers[index].layerID;
        const beforLayerId = exsitLayers[index + 1].layerID;
        this.map.moveLayer(targetlayerId, beforLayerId);
      }
      this.triggerEvent('addlayerssucceeded', {
        map: this.map,
        mapparams: this.mapParams,
        layers: this._layers
      });
    }
  }

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
        fillOpacity: 'fill-opacity'
        // strokeColor: 'fill-outline-color'
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
      newObj['line-dasharray'] = this.getDashStyle(style.lineDash);
    }
    return newObj;
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
      this._addLayer({
        id: layerID,
        type: mbglType,
        source: source,
        paint: layerStyle.style,
        layout: layerStyle.layout || {}
      });
    }
  }

  private _addBaselayer(
    url: Array<string>,
    layerID: string,
    visibility = true,
    minzoom = 0,
    maxzoom = 22,
    isIserver = false
  ): void {
    let source: mapboxglTypes.RasterSource = {
      type: 'raster',
      tiles: url,
      tileSize: 256,
      // @ts-ignore
      rasterSource: isIserver ? 'iserver' : '',
      // @ts-ignore
      prjCoordSys: isIserver ? { epsgCode: this.baseProjection.split(':')[1] } : ''
    };
    this._addLayer({
      id: layerID,
      type: 'raster',
      source: source,
      minzoom: minzoom || 0,
      maxzoom: maxzoom || 22,
      layout: {
        visibility: visibility ? 'visible' : 'none'
      }
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

  _createMvtLayer(info, layerInfo, featureType) {
    let style = this._getDataVectorTileStyle(featureType);
    let paint = this._transformStyleToMapBoxGl(style, featureType);
    let url = info.url + '/tileFeature.mvt';
    let origin = mapboxgl.CRS.get(this.baseProjection).getOrigin();
    url += `?&returnAttributes=true&width=512&height=512&x={x}&y={y}&scale={scale}&origin={x:${origin[0]},y:${origin[1]}}`;
    this._addLayer({
      id: layerInfo.layerID,
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
    this._addLayerSucceeded();
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

  _unproject(point: [number, number]): [number, number] {
    // @ts-ignore
    return proj4(
      this._unprojectProjection || this.baseProjection,
      this.baseProjection === 'EPSG:3857' ? 'EPSG:4326' : this.baseProjection,
      point
    );
  }
  private _getMapCenter(mapInfo) {
    // center
    let center: [number, number] | mapboxglTypes.LngLat;
    center = mapInfo.center && [mapInfo.center.x, mapInfo.center.y];

    if (!center) {
      center = [0, 0];
    }
    if (this.baseProjection === 'EPSG:3857') {
      center = this._unproject(center);
    }

    center = new mapboxgl.LngLat(center[0], center[1]);

    return center;
  }

  private _getLabelFontFamily(mapInfo) {
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

    return fontFamilys;
  }

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

  private _defineProj4(epsgCode) {
    const defName = `EPSG:${epsgCode}`;
    const defValue = this.webMapService.getEpsgcodeWkt(defName);
    proj4.defs(defName, defValue);
  }

  private _addLayer(layerInfo) {
    const { id } = layerInfo;
    Array.isArray(this._cacheLayerId) && this._cacheLayerId.push(id);
    layerInfo = Object.assign(layerInfo, { id });
    this.map.addLayer(layerInfo);
  }

  cleanWebMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.center = null;
      this.zoom = null;
      this._dataflowService && this._dataflowService.off('messageSucceeded', this._handleDataflowFeaturesCallback);
      this._unprojectProjection = null;
    }
  }

  private centerValid(center) {
    if (
      center &&
      ((<[number, number]>center).length > 0 ||
        typeof center === mapboxgl.LngLat ||
        (<{ lng: number; lat: number }>center).lng)
    ) {
      return true;
    }
    return false;
  }

  private _getResolution(bounds, tileSize = 512.0) {
    if (bounds.leftBottom && bounds.rightTop) {
      return Math.max(bounds.rightTop.x - bounds.leftBottom.x, bounds.rightTop.y - bounds.leftBottom.y) / tileSize;
    }
    return Math.max(bounds[2] - bounds[0], bounds[3] - bounds[1]) / tileSize;
  }
}
