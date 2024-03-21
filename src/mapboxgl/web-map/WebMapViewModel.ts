/* Copyright© 2000 - 2023 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import { Events } from 'vue-iclient/src/common/_types/event/Events';
import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from 'vue-iclient/src/mapboxgl/web-map/SourceListModel';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import 'vue-iclient/static/libs/geostats/geostats';
import 'vue-iclient/static/libs/json-sql/jsonsql';
import { toEpsgCode } from 'vue-iclient/src/common/_utils/epsg-define';
import WebMapService from '../../common/_utils/WebMapService';
import WebMapV2 from './WebMapV2';

const WORLD_WIDTH = 360;
// 迁徙图最大支持要素数量
/**
 * @class WebMapViewModel
 * @category ViewModel
 * @classdesc 对接 iPortal/Online 地图类。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @param {number} id - iPortal|Online 地图 ID。
 * @param {Object} options - 参数。
 * @param {string} [options.target='map'] - 地图容器 ID。
 * @param {string} [options.serverUrl="https://www.supermapol.com"] - SuperMap iPortal/Online 服务器地址。当设置 `id` 时有效。
 * @param {string} [options.accessToken] - 用于访问 SuperMap iPortal 、SuperMap Online 中受保护的服务。当设置 `id` 时有效。
 * @param {string} [options.accessKey] - SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。当设置 `id` 时有效。
 * @param {String} [options.tiandituKey] - 用于访问天地图的服务。当设置 `id` 时有效。
 * @param {String} [options.googleMapsAPIKey] - 用于访问谷歌地图。当设置 `id` 时有效。
 * @param {String} [options.googleMapsLanguage] - 用于定义在谷歌地图图块上显示标签的语言。当设置 `id` 且底图为谷歌地图时有效。
 * @param {boolean} [options.withCredentials=false] - 请求是否携带 cookie。当设置 `id` 时有效。
 * @param {boolean} [options.excludePortalProxyUrl] - server 传递过来的 URL 是否带有代理。当设置 `id` 时有效。
 * @param {boolean} [options.ignoreBaseProjection = 'false'] - 是否忽略底图坐标系和叠加图层坐标系不一致。
 * @param {String} [options.iportalServiceProxyUrlPrefix] - iportal的代理服务地址前缀。
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
  googleMapsAPIKey?: string;
  googleMapsLanguage?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  isSuperMapOnline?: boolean;
  center?: number[];
  zoom?: number;
  proxy?: boolean | string;
  iportalServiceProxyUrlPrefix?: string;
  checkSameLayer?: boolean;
}
interface mapOptions {
  center?: [number, number] | mapboxglTypes.LngLatLike | { lon: number; lat: number } | number[];
  zoom?: number;
  bounds?: mapboxglTypes.LngLatBoundsLike;
  maxBounds?: [[number, number], [number, number]] | mapboxglTypes.LngLatBoundsLike;
  minZoom?: number;
  maxZoom?: number;
  renderWorldCopies?: boolean;
  bearing?: number;
  pitch?: number;
  style?: any;
  rasterTileSize?: number;
  container?: string;
  crs: string;
}

type layerType = 'POINT' | 'LINE' | 'POLYGON';

export default class WebMapViewModel extends Events {
  map: mapboxglTypes.Map;

  center: [number, number] | mapboxglTypes.LngLatLike | { lon: number; lat: number } | number[];

  bounds: mapboxglTypes.LngLatBoundsLike;

  renderWorldCopies: boolean;

  bearing: number;

  pitch: number;

  rasterTileSize: number;

  proxy: string | boolean;

  mapOptions: any;

  layerFilter: Function;

  baseLayerProxy: string | boolean;

  mapId: string | number | Object;

  webMapInfo: any;

  serverUrl: string;

  zoom: number;

  target: string;

  mapParams: { title?: string; description?: string };

  withCredentials: boolean;

  baseProjection: string;

  _version: string;

  protected _taskID: Date;

  private _sourceListModel: SourceListModel;

  private _cacheLayerId: Array<string> = [];

  private _layerTimerList: Array<any> = [];

  // 可感知图层集合
  private _appreciableLayers: Array<any> = [];

  private _handler: Object;

  protected webMapService: WebMapService;

  protected layerAdded: number;

  protected expectLayerLen: number;

  constructor(
    id: string | number | Object,
    options: webMapOptions = {},
    // @ts-ignore fix-mapoptions
    mapOptions: mapOptions = { style: { version: 8, sources: {}, layers: [] } },
    map?: mapboxglTypes.Map,
    layerFilter: Function = function () {
      return true;
    }
  ) {
    super();
    if (typeof id === 'string' || typeof id === 'number') {
      this.mapId = id;
    } else if (id !== null && typeof id === 'object') {
      this.webMapInfo = id;
    }
    if (!this.mapId && !mapOptions.center && !mapOptions.zoom) {
      mapOptions.center = [0, 0];
      mapOptions.zoom = 0;
    }
    if (this.centerValid(mapOptions.center)) {
      this.center = mapOptions.center;
    }
    this.zoom = mapOptions.zoom;
    this.bounds = mapOptions.bounds;
    this.bearing = mapOptions.bearing;
    this.pitch = mapOptions.pitch;
    this.target = options.target || 'map';
    this.renderWorldCopies = mapOptions.renderWorldCopies;
    this.rasterTileSize = mapOptions.rasterTileSize || 256;
    this.layerFilter = layerFilter;
    this._appreciableLayers = [];
    this.webMapService = new WebMapService(id, options);
    this.mapOptions = mapOptions;
    this.eventTypes = [
      'getmapinfofailed',
      'crsnotsupport',
      'getlayerdatasourcefailed',
      'addlayerssucceeded',
      'notsupportmvt',
      'notsupportbaidumap',
      'projectionIsNotMatch',
      'beforeremovemap',
      'mapinitialized'
    ];
    if (map) {
      this.map = map;
      this._taskID = new Date();
      this.getMapInfo(this._taskID);
    } else {
      this._initWebMap();
    }
  }

  public resize(keepBounds = false): void {
    this.map && this.map.resize();
    // @ts-ignore
    this._handler.echartsLayerResize && this._handler.echartsLayerResize();
    const mapContainerStyle = window.getComputedStyle(document.getElementById(this.target));
    if (keepBounds && this.map && this.bounds && mapContainerStyle) {
      const zoom = this._getResizedZoom(this.bounds, mapContainerStyle);
      if (zoom !== this.map.getZoom()) {
        this.map && this.map.setZoom(zoom);
      }
    }
  }

  public setCrs(crs): void {
    if (this.map) {
      this.mapOptions.crs = crs;
      if (this.mapOptions.crs) {
        if (crs.epsgCode) {
          this.mapOptions.crs = new mapboxgl.CRS(
            this.mapOptions.crs.epsgCode,
            this.mapOptions.crs.WKT,
            this.mapOptions.crs.extent,
            this.mapOptions.crs.unit
          );
          // @ts-ignore
          this.map.setCRS(this.mapOptions.crs);
        } else {
          // @ts-ignore
          this.map.setCRS(mapboxgl.CRS.get(crs));
        }
      }
    }
  }

  public setCenter(center): void {
    if (this.map && this.centerValid(center)) {
      this.mapOptions.center = center;
      const { lng, lat } = this.map.getCenter();
      if (center[0] !== +lng.toFixed(4) || center[1] !== +lat.toFixed(4)) {
        this.map.setCenter(center, { from: 'setCenter' });
      }
    }
  }

  public setRenderWorldCopies(renderWorldCopies): void {
    if (this.map) {
      this.mapOptions.renderWorldCopies = renderWorldCopies;
      this.map.setRenderWorldCopies(renderWorldCopies);
    }
  }

  public setBearing(bearing): void {
    if (this.map) {
      this.mapOptions.bearing = bearing;
      if (bearing !== +this.map.getBearing().toFixed(2)) {
        (bearing || bearing === 0) && this.map.setBearing(bearing);
      }
    }
  }

  public setPitch(pitch): void {
    if (this.map) {
      this.mapOptions.pitch = pitch;
      if (pitch !== +this.map.getPitch().toFixed(2)) {
        (pitch || pitch === 0) && this.map.setPitch(pitch);
      }
    }
  }

  public setStyle(style): void {
    if (this.map) {
      this.mapOptions.style = style;
      style && this.map.setStyle(style);
      if (style && style.layers && style.layers.length > 0) {
        this.triggerEvent('addlayerssucceeded', {
          map: this.map,
          mapparams: {},
          layers: []
        });
      }
    }
  }

  public setRasterTileSize(tileSize) {
    if (this.map) {
      if (tileSize <= 0) {
        return;
      }
      const sources = this.map.getStyle().sources;
      Object.keys(sources).forEach(sourceId => {
        // @ts-ignore
        if (sources[sourceId].type === 'raster' && sources[sourceId].rasterSource === 'iserver') {
          // this._updateRasterSource(sourceId, { tileSize });
        }
      });
    }
  }

  public getAppreciableLayers() {
    // @ts-ignore
    return this._appreciableLayers;
  }

  public getLegendInfo() {
    // @ts-ignore
    return this._handler.getLegendInfo();
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

  protected initWebMap() {
    this.cleanWebMap();
    this.serverUrl = this.serverUrl && this.webMapService.handleServerUrl(this.serverUrl);
    if (this.webMapInfo) {
      // 传入是webmap对象
      const mapInfo = this.webMapInfo;
      mapInfo.mapParams = {
        title: this.webMapInfo.title,
        description: this.webMapInfo.description
      };
      this.mapParams = mapInfo.mapParams;
      this._getMapInfo(mapInfo);
      return;
    } else if (!this.mapId || !this.serverUrl) {
      this._createMap();
      return;
    }
    this._taskID = new Date();
    this.getMapInfo(this._taskID);
  }

  public setZoom(zoom) {
    if (this.map) {
      this.mapOptions.zoom = zoom;
      if (zoom !== +this.map.getZoom().toFixed(2)) {
        (zoom || zoom === 0) && this.map.setZoom(zoom, { from: 'setZoom' });
      }
    }
  }

  public setServerUrl(serverUrl: string): void {
    this.serverUrl = serverUrl;
    this.webMapService.setServerUrl(serverUrl);
  }

  public setWithCredentials(withCredentials) {
    this.withCredentials = withCredentials;
    this.webMapService.setWithCredentials(withCredentials);
  }

  public setProxy(proxy) {
    this.proxy = proxy;
    this.webMapService.setProxy(proxy);
  }

  public setMapId(mapId: string | number): void {
    if (typeof mapId === 'string' || typeof mapId === 'number') {
      this.mapId = mapId;
      this.webMapInfo = null;
    } else if (mapId !== null && typeof mapId === 'object') {
      this.webMapInfo = mapId;
    }
    this.webMapService.setMapId(mapId);
    if (!mapId) {
      return;
    }
    setTimeout(() => {
      this._initWebMap();
    }, 0);
  }

  protected getMapInfo(_taskID) {
    this.serverUrl = this.serverUrl && this.webMapService.handleServerUrl(this.serverUrl);
    this.webMapService
      .getMapInfo()
      .then(
        (mapInfo: any) => {
          if (this._taskID !== _taskID) {
            return;
          }
          // 存储地图的名称以及描述等信息，返回给用户
          this.mapParams = mapInfo.mapParams;
          this._getMapInfo(mapInfo, _taskID);
        },
        error => {
          throw error;
        }
      )
      .catch(error => {
        this.triggerEvent('getmapinfofailed', { error });
        console.log(error);
      });
  }

  get getSourceListModel(): SourceListModel {
    return this._sourceListModel;
  }

  _initWebMap(): void {
    this.initWebMap();
  }

  _createWebMapV2(mapInfo) {
    this.baseProjection = toEpsgCode(mapInfo.crs);
    const webMapHandler = new WebMapV2(this.mapId, {
      serverUrl: this.serverUrl,
      withCredentials: this.withCredentials,
      target: this.target,
      mapInfo
    });
    this._registerWebMapV2Events(webMapHandler);
    return webMapHandler;
  }

  _createMap() {
    this.mapOptions.container = this.target;
       if (this.mapOptions.crs && this.mapOptions.crs.epsgCode) {
         this.mapOptions.crs = new mapboxgl.CRS(
           this.mapOptions.crs.epsgCode,
           this.mapOptions.crs.WKT,
           this.mapOptions.crs.extent,
           this.mapOptions.crs.unit
         );
       }
       if (!this.mapOptions.transformRequest) {
         this.mapOptions.transformRequest = (url: string, resourceType: string) => {
           let proxy = '';
           if (typeof this.proxy === 'string') {
             let proxyType = 'data';
             if (resourceType === 'Tile') {
               proxyType = 'image';
             }
             proxy = this.webMapService.handleProxy(proxyType);
           }
           return {
             url: proxy ? `${proxy}${encodeURIComponent(url)}` : url,
             credentials: this.webMapService.handleWithCredentials(proxy, url, this.withCredentials || false)
               ? 'include'
               : 'omit'
           };
         };
       }
       setTimeout(() => {
         let fadeDuration = 0;
         if (Object.prototype.hasOwnProperty.call(this.mapOptions, 'fadeDuration')) {
           fadeDuration = this.mapOptions.fadeDuration;
         }
         this.map = new mapboxgl.Map({ ...this.mapOptions, fadeDuration });
         this.map.on('load', () => {
          console.log('this', this);
           this.triggerEvent('addlayerssucceeded', {
             map: this.map,
             mapparams: {},
             layers: []
           });
         });
       }, 0);
  };

  _createWebMapV3(mapInfo: any) {
    this.baseProjection = toEpsgCode(mapInfo.crs);
    const webMapHandler = new mapboxgl.supermap.WebMapV3(this.mapId, {
      server: this.serverUrl,
      withCredentials: this.withCredentials,
      target: this.target
    });
    this._registerWebMapEvents(webMapHandler);
    webMapHandler.createWebMap({
      ...mapInfo,
      layers: typeof this.layerFilter === 'function' ? mapInfo.layers.filter(this.layerFilter) : mapInfo.layers
    }, this.map);
    return webMapHandler;
  }

  _registerWebMapV2Events(webMapHandler): void {
    if (!webMapHandler) {
      return;
    }
    let _this = this;
    webMapHandler.on({
      mapinitialized: ({ map }) => {
        this.map = map;
        this.triggerEvent('mapinitialized', { map: this.map });
      },
      addlayerssucceeded: ({ mapparams, map, sourceListModel, layers }) => {
        _this.mapParams = mapparams;
        _this._sourceListModel = sourceListModel;
        this._appreciableLayers = layers;
        this._cacheLayerId.push(...layers.map(layer => layer.id));
        _this.triggerEvent('addlayerssucceeded', {
          map: map,
          mapparams: _this.mapParams
        });
      },
    })
    webMapHandler.on('projectionisnotmatch', () => {
      console.error('projection is not match');
    });
  }

  _registerWebMapEvents(webMapHandler): void {
    if (!webMapHandler) {
      return;
    }
    webMapHandler.on('mapinitialized', ({ map }) => {
      this.map = map;
      this.triggerEvent('mapinitialized', { map: this.map });
    });
    webMapHandler.on('addlayerssucceeded', ({ mapparams, layers }) => {
      this.mapParams = mapparams;
      this._appreciableLayers = layers;
      this._sourceListModel = new SourceListModel({
        map: this.map
      });
      this._cacheLayerId.push(...layers.map(layer => layer.id));
      this.triggerEvent('addlayerssucceeded', {
        map: this.map,
        mapparams: this.mapParams
      });
    });
    webMapHandler.on('getlayerresourcesfailed', () => {
      console.error('map add images failed.');
    });
    webMapHandler.on('projectionisnotmatch', () => {
      console.error('projection is not match');
    });
  }

  _getMapInfo(mapInfo, _taskID?) {
    this._version = mapInfo.version;
    this._handler = +mapInfo.version.split('.')[0] === 3 ? this._createWebMapV3(mapInfo) : this._createWebMapV2(mapInfo);
  }

  private _getResizedZoom(bounds, mapContainerStyle, tileSize = 512, worldWidth = WORLD_WIDTH) {
    const { width, height } = mapContainerStyle;
    const lngArcLength = Math.abs(bounds.getEast() - bounds.getWest());
    const latArcLength = Math.abs(this._getBoundsRadian(bounds.getSouth()) - this._getBoundsRadian(bounds.getNorth()));
    const lngResizeZoom = +Math.log2(worldWidth / ((lngArcLength / parseInt(width)) * tileSize)).toFixed(2);
    const latResizeZoom = +Math.log2(worldWidth / ((latArcLength / parseInt(height)) * tileSize)).toFixed(2);
    if (lngResizeZoom <= latResizeZoom) {
      return lngResizeZoom;
    }
    return latResizeZoom;
  }

  private _getBoundsRadian(point) {
    return (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (point * Math.PI) / 360));
  }

  public setLayersVisible(isShow, ignoreIds) {
    const show = isShow ? 'visible' : 'none';
    if (this._cacheLayerId.length) {
      this._cacheLayerId.forEach(layerId => {
        if ((ignoreIds && !ignoreIds.includes(layerId)) || !ignoreIds) {
          this.map.setLayoutProperty(layerId, 'visibility', show);
        }
      });
    }
  }

  cleanWebMap() {
    if (this.map) {
      this.triggerEvent('beforeremovemap', {});
      // this.stopCanvg();
      this.map.remove();
      this.map = null;
      this._sourceListModel = null;
      this.center = null;
      this.zoom = null;
      this._appreciableLayers = [];
    }
    if (this._layerTimerList.length) {
      this._layerTimerList.forEach(timer => {
        clearInterval(timer);
      });
      this._layerTimerList = [];
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

  public updateOverlayLayer(layerInfo: any, features: any, mergeByField?: string) {
    // @ts-ignore
    this._handler.updateOverlayLayer && this._handler.updateOverlayLayer(layerInfo, features, mergeByField);

    
  }
}
