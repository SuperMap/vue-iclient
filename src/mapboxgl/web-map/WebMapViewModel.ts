/* Copyright© 2000 - 2023 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import { Events } from 'vue-iclient/src/common/_types/event/Events';
import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import 'vue-iclient/static/libs/geostats/geostats';
import 'vue-iclient/static/libs/json-sql/jsonsql';
import WebMapService from '../../common/_utils/WebMapService';
import WebMapV2 from './WebMapV2';
import MapStyle from './MapStyle';
import iPortalDataService from 'vue-iclient/src/common/_utils/iPortalDataService';
import { getGroupChildrenLayers } from 'vue-iclient/src/mapboxgl/web-map/GroupUtil';
import difference from 'lodash.difference';

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
  bingMapsKey?: string;
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

interface MapHandler {
  initializeMap: (mapInfo?: Record<string, any>, map?: mapboxglTypes.Map) => void;
  clean: () => void;
  getLayerCatalog: () => any[];
  getLegendInfo: () => any[];
  getAppreciableLayers: () => any[];
  _updateRasterSource?: (sourceId: string, options: { tileSize: number }) => void;
  echartsLayerResize?: () => void;
  updateOverlayLayer?: (layerInfo: Record<string, any>, features: any, mergeByField?: string) => void;
  copyLayer?: (id: string, layerInfo: Record<string, any>) => boolean;
}

export default class WebMapViewModel extends Events {
  map: mapboxglTypes.Map;

  center: [number, number] | mapboxglTypes.LngLatLike | { lon: number; lat: number } | number[];

  bounds: mapboxglTypes.LngLatBoundsLike;

  renderWorldCopies: boolean;

  proxy: string | boolean;

  mapOptions: any;

  options: any;

  layerFilter: Function;

  baseLayerProxy: string | boolean;

  mapId: string | number | Object;

  webMapInfo: any;

  serverUrl: string;

  zoom: number;

  target: string;

  mapParams: { title?: string; description?: string };

  withCredentials: boolean;

  protected _taskID: Date;

  private _cacheCleanLayers: any[] = [];

  private _cacheLayerIds: string[];

  private _handler: MapHandler;

  private _appreciableLayersVisibleMap: Map<string, boolean> = new Map();

  protected webMapService: WebMapService;

  eventTypes: string[];

  private appreciableLayers: Array<Record<string, any>> = [];
  private layerCatalogs: Array<Record<string, any>> = [];
  private _appendLayers = false;

  triggerEvent: (name: string, ...rest: any) => any;

  on: (data: Record<string, (...rest: any) => void>) => void;

  un: (data: Record<string, (...rest: any) => void>) => void;

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
    this.serverUrl = options.serverUrl || 'https://www.supermapol.com';
    this.proxy = options.proxy;
    if (typeof id === 'string' || typeof id === 'number') {
      this.mapId = id;
    } else if (id !== null && typeof id === 'object') {
      this.webMapInfo = id;
    }
    if (!this.mapId && !mapOptions.center && !mapOptions.zoom) {
      mapOptions.center = [0, 0];
      mapOptions.zoom = 0;
    }
    this.bounds = mapOptions.bounds;
    this.target = options.target || 'map';
    this.options = options;
    this.withCredentials = options.withCredentials || false;
    this.renderWorldCopies = mapOptions.renderWorldCopies;
    this.layerFilter = layerFilter;
    this.webMapService = new WebMapService(id, options);
    this.mapOptions = mapOptions;
    this.eventTypes = [
      'getmapinfofailed',
      'crsnotsupport',
      'getlayerdatasourcefailed',
      'addlayerssucceeded',
      'notsupportmvt',
      'notsupportbaidumap',
      'projectionisnotmatch',
      'beforeremovemap',
      'mapinitialized',
      'getlayersfailed',
      'layersupdated'
    ];
    this._mapInitializedHandler = this._mapInitializedHandler.bind(this);
    this._addLayersSucceededHandler = this._addLayersSucceededHandler.bind(this);
    this._styleDataUpdatedHandler = this._styleDataUpdatedHandler.bind(this);
    if (map) {
      this.map = map;
      this._appendLayers = true;
    }
    this._initWebMap(!this.map);
  }

  public resize(keepBounds = false): void {
    this.map && this.map.resize();
    this._handler?.echartsLayerResize?.();
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
      this._initWebMap();
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
          this._handler._updateRasterSource?.(sourceId, { tileSize });
        }
      });
    }
  }

  public getAppreciableLayers() {
    return this.appreciableLayers;
  }

  public getLegendInfo() {
    return this._handler?.getLegendInfo() ?? [];
  }

  private getLayerVisible(layer: Record<string, any>) {
    const id = this.getLayerVisibleId(layer);
    return this._appreciableLayersVisibleMap.has(id) ? this._appreciableLayersVisibleMap.get(id) : layer.visible;
  }

  private getLayerVisibleId(layer: Record<string, any>) {
    return `${layer.type}-${layer.id}`;
  }

  public getLayerList() {
    return this.layerCatalogs;
  }

  private _updateLayerCatalogsVisible(catalogs: Array<Record<string, any>>) {
    for (const data of catalogs) {
      data.visible = this.getLayerVisible(data);
      if (data.type === 'group') {
        this._updateLayerCatalogsVisible(data.children);
      }
    }
  }

  protected cleanLayers() {
    this._taskID = null;
    const sourceList = [];
    for (const item of this._cacheCleanLayers) {
      item.renderLayers.forEach((layerId: string) => {
        if (this.map?.getLayer(layerId)) {
          this.map.removeLayer(layerId);
        }
      });
      if (this.map?.getSource(item.renderSource.id)) {
        sourceList.push(item.renderSource.id);
      }
    }
    Array.from(new Set(sourceList)).forEach(sourceId => {
      this.map.removeSource(sourceId);
    });
    this._cacheCleanLayers = [];
  }

  public getLayerDatas(item) {
    const isGeojson = item.renderSource.type === 'geojson';
    if (isGeojson) {
      // @ts-ignore
      return Promise.resolve(this.map.getSource(item.renderSource.id).getData().features);
    } else {
      const dataId = item.dataSource.serverId;
      // TODO iserver服务也可获取要素
      if (!dataId) return [];
      let promise = new Promise((resolve, reject) => {
        const dataService = new iPortalDataService(`${this.serverUrl}web/datas/${dataId}`, this.withCredentials, { dataType: 'STRUCTUREDDATA' });
        dataService.on({
          getdatafailed: e => {
            reject(e);
          },
          getdatasucceeded: e => {
            resolve(e.features);
          }
        });
        dataService.getData({});
      });
      return promise;
    }
  }

  public changeItemVisible(item: Record<string, any>, visible: boolean) {
    const visibility = visible ? 'visible' : 'none';
    if (item.type === 'group') {
      const visbleId = this.getLayerVisibleId(item);
      this._appreciableLayersVisibleMap.set(visbleId, visible);
      const targetLayers = getGroupChildrenLayers(item.children);
      this.updateLayersVisible(targetLayers, visibility);
    } else {
      this.updateLayersVisible([item], visibility);
    }
  }

  updateLayersVisible(layers: Array<Record<string, any>>, visibility: 'visible' | 'none', ignoreIds: string[] = []) {
    layers.forEach(layer => {
      const visbleId = this.getLayerVisibleId(layer);
      this._appreciableLayersVisibleMap.set(visbleId, visibility === 'visible');
      if ('l7MarkerLayer' in layer && !ignoreIds.some(id => id === layer.id)) {
        visibility === 'visible' ? layer.l7MarkerLayer.show() : layer.l7MarkerLayer.hide();
        return;
      }
      layer.renderLayers.forEach((layerId: string) => {
        if (!ignoreIds.some(id => id === layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      });
    });
    this._styleDataUpdatedHandler();
  }

  protected initWebMap(clean = true) {
    clean && this.clean();
    this.serverUrl = this.serverUrl && this.webMapService.handleServerUrl(this.serverUrl);
    if (this.webMapInfo) {
      // 传入是webmap对象
      const mapInfo = this.webMapInfo;
      mapInfo.mapParams = {
        title: this.webMapInfo.title,
        description: this.webMapInfo.description
      };
      this.mapParams = mapInfo.mapParams;
      Promise.resolve()
        .then(() => {
          this._getMapInfo(mapInfo);
        })
        .catch(error => {
          this.triggerEvent('getmapinfofailed', { error });
        });
      return;
    } else if (!this.mapId || !this.serverUrl) {
      Promise.resolve()
        .then(() => {
          this._createMap('MapStyle');
        })
        .catch(error => {
          this.triggerEvent('getmapinfofailed', { error });
        });
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
          this._getMapInfo(mapInfo);
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

  _initWebMap(clean = true): void {
    this.initWebMap(clean);
  }

  _createMapStyle(commonOptions: webMapOptions, commonEvents: Record<string, Function>) {
    const mapStyleHandler = new MapStyle(this.mapId, commonOptions, this.mapOptions, this.layerFilter);
    mapStyleHandler.on(commonEvents);
    return mapStyleHandler;
  }

  _createWebMapV2(commonOptions: webMapOptions, commonEvents: Record<string, Function>) {
    const webMapHandler = new WebMapV2(
      this.mapId,
      {
        ...commonOptions,
        parentEvents: commonEvents
      },
      this.mapOptions,
      this.layerFilter
    );
    return webMapHandler;
  }

  _createWebMapV3(commonOptions: webMapOptions, commonEvents: Record<string, Function>) {
    const webMapHandler = new mapboxgl.supermap.WebMapV3(
      this.mapId,
      { ...commonOptions, server: this.serverUrl, iportalServiceProxyUrl: this.webMapService.iportalServiceProxyUrl },
      this.mapOptions
    );
    for (const type in commonEvents) {
      webMapHandler.on(type, commonEvents[type]);
    }
    return webMapHandler;
  }

  _mapInitializedHandler({ map }) {
    this.map = map;
    this.triggerEvent('mapinitialized', { map: this.map });
    this.map.on('styledata', this._styleDataUpdatedHandler);
  }

  _styleDataUpdatedHandler() {
    const layers = this._handler?.getAppreciableLayers() ?? [];
    const layerCatalogs = this._handler?.getLayerCatalog() ?? [];
    const catalogIds = this._getCatalogVisibleIds(layerCatalogs);
    const visibleIds = Array.from(this._appreciableLayersVisibleMap.keys());
    const unsetKeys = difference(visibleIds, catalogIds);
    unsetKeys.forEach((item: string) => {
      this._appreciableLayersVisibleMap.delete(item);
    });
    this.appreciableLayers = layers.map(item => {
      return {
        ...item,
        visible: this.getLayerVisible(item)
      };
    });
    this._updateLayerCatalogsVisible(layerCatalogs);
    this.layerCatalogs = layerCatalogs;
    if (!this._appendLayers) {
      this.triggerEvent('layersupdated', {
        appreciableLayers: this.appreciableLayers,
        layerCatalogs: this.layerCatalogs
      });
    }
  }

  private _getCatalogVisibleIds(layers: Array<Record<string, any>>) {
    const results = [];
    for (const layer of layers) {
      results.push(this.getLayerVisibleId(layer));
      const { children } = layer;
      if (children && children.length > 0) {
        const result = this._getCatalogVisibleIds(children);
        results.push(...result);
      }
    }
    return results;
  }

  _addLayersSucceededHandler({ mapparams, layers, cacheLayerIds }) {
    this.mapParams = mapparams;
    this._cacheCleanLayers = layers;
    this._cacheLayerIds = cacheLayerIds;
    this._styleDataUpdatedHandler();
    this.triggerEvent('addlayerssucceeded', {
      map: this.map,
      mapparams: this.mapParams,
      layers
    });
  }

  _getMapInfo(mapInfo: Record<string, any>) {
    const type = +mapInfo.version.split('.')[0] === 3 ? 'WebMap3' : 'WebMap2';
    this._createMap(type, mapInfo);
  }

  _createMap(type: 'MapStyle' | 'WebMap3' | 'WebMap2', mapInfo?: Record<string, any>) {
    const commonOptions: webMapOptions = {
      ...this.options,
      iportalServiceProxyUrlPrefix: this.webMapService.iportalServiceProxyUrl,
      serverUrl: this.serverUrl,
      withCredentials: this.withCredentials,
      target: this.target
    };
    const commonEvents = {
      ...this.eventTypes.reduce((events, name) => {
        events[name] = params => {
          this.triggerEvent(name, params);
        };
        return events;
      }, {}),
      mapinitialized: this._mapInitializedHandler,
      addlayerssucceeded: this._addLayersSucceededHandler
    };
    switch (type) {
      case 'MapStyle':
        this._handler = this._createMapStyle(commonOptions, commonEvents);
        break;
      case 'WebMap3':
        this._handler = this._createWebMapV3(commonOptions, commonEvents);
        break;
      default:
        this._handler = this._createWebMapV2(commonOptions, commonEvents);
        break;
    }
    let _mapInfo: Record<string, any> = {};
    if (mapInfo) {
      _mapInfo = {
        ...mapInfo,
        layers: typeof this.layerFilter === 'function' ? mapInfo.layers.filter(this.layerFilter) : mapInfo.layers
      };
    }
    this._handler.initializeMap(_mapInfo, this.map);
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

  public setLayersVisible(isShow: boolean, ignoreIds?: string[], onlyClear?: boolean) {
    // 只有 webmapv2 支持
    const visibility = isShow ? 'visible' : 'none';
    this._appreciableLayersVisibleMap.clear();
    if (!onlyClear) {
      const layers = this._cacheLayerIds?.map(id => {
        const layer = this.map.getLayer(id);
        return {
          id,
          type: layer.type,
          renderLayers: [id]
        };
      }) ?? [];
      this.updateLayersVisible(layers, visibility, ignoreIds);
      return;
    }
    this._styleDataUpdatedHandler();
  }

  clean() {
    if (this.map) {
      this.triggerEvent('beforeremovemap', {});
      this.map.off('styledata', this._styleDataUpdatedHandler);
      this._handler?.clean();
      this._handler = null;
      this.map = null;
      if (this.mapOptions && (this.mapId || this.webMapInfo)) {
        this.mapOptions.center = null;
        this.mapOptions.zoom = null;
      }
    }
  }

  cleanWebMap() {
    this.clean();
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
    this._handler?.updateOverlayLayer?.(layerInfo, features, mergeByField);
  }

  get cacheLayerIds(): string[] {
    return this._cacheLayerIds || this._cacheCleanLayers.reduce((ids, item) => {
      ids.push(...item.renderLayers);
      return ids;
    }, []);
  }

  copyLayer(id: string, layerInfo: Record<string, any>) {
    return this._handler?.copyLayer?.(id, layerInfo);
  }
}
