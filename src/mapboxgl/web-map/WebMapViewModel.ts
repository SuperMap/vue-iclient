/* Copyright© 2000 - 2024 SuperMap Software Co.Ltd. All rights reserved.
 * This program are made available under the terms of the Apache License, Version 2.0
 * which accompanies this distribution and is available at http://www.apache.org/licenses/LICENSE-2.0.html. */
import { Events } from 'vue-iclient/src/common/_types/event/Events';
import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import 'vue-iclient/static/libs/geostats/geostats';
import 'vue-iclient/static/libs/json-sql/jsonsql';
import echarts from 'echarts';
import EchartsLayer from 'vue-iclient/static/libs/echarts-layer/EchartsLayer';
import iPortalDataService from 'vue-iclient/src/common/_utils/iPortalDataService';
import { getGroupChildrenLayers } from 'vue-iclient/src/mapboxgl/web-map/GroupUtil';
import difference from 'lodash.difference';
import proj4 from 'proj4';

// @ts-ignore
window.echarts = echarts;
// @ts-ignore
window.EchartsLayer = EchartsLayer;

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
  map?: mapboxglTypes.Map;
  layerFilter?: () => boolean;
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

interface CRSOptions {
  epsgCode: string;
  WKT: string;
  extends: any[];
  unit: string;
}

interface MapHandler {
  initializeMap: (mapInfo?: Record<string, any>, map?: mapboxglTypes.Map) => void;
  clean: () => void;
  cleanLayers: () => void;
  getLayerCatalog: () => any[];
  getLegends: () => any[];
  getLayers: () => any[];
  echartsLayerResize: () => void;
  updateOverlayLayer: (layerInfo: Record<string, any>, features: any, mergeByField?: string) => void;
  copyLayer: (id: string, layerInfo: Record<string, any>) => boolean;
  resize: (keepBounds: boolean) => void;
  setCRS: (crs: CRSOptions | string) => void;
  setCenter: (center: [number, number]) => void;
  setRenderWorldCopies: (renderWorldCopies: boolean) => void;
  setBearing: (bearing: number) => void;
  setPitch: (pitch: number) => void;
  setMapId: (mapId: string | number) => void;
  setServerUrl: (serverUrl: string) => void;
  setStyle: (style: mapboxglTypes.Style) => void;
  setRasterTileSize: (tileSize: number) => void;
  setMaxBounds: (maxBounds: any[]) => void;
  setZoom: (zoom: number) => void;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (minZoom: number) => void;
  setProxy: (proxy: string) => void;
  setWithCredentials: (withCredentials: boolean) => void;
  on: (type: string, callback: () => void) => void;
}

interface AddlayerssucceededParams {
  map: mapboxglTypes.Map;
  mapparams: Record<string, any>;
  layers: Record<string, any>[];
  allLoaded: boolean;
}

export default class WebMapViewModel extends Events {
  map: mapboxglTypes.Map;

  mapOptions: any;

  options: any;

  mapId: string | number | Object;

  serverUrl: string;

  mapParams: { title?: string; description?: string };

  eventTypes: string[];

  webMapEventTypes: string[];

  selfEventTypes: string[];

  private _cacheCleanLayers: any[] = [];

  private _handler: MapHandler;

  private _appreciableLayersVisibleMap: Map<string, boolean> = new Map();

  private appreciableLayers: Array<Record<string, any>> = [];

  private layerCatalogs: Array<Record<string, any>> = [];

  private _appendLayers = false;

  triggerEvent: (name: string, ...rest: any) => any;

  on: (data: Record<string, (...rest: any) => void>) => void;

  un: (data: Record<string, (...rest: any) => void>) => void;

  constructor(
    id: string | number | Object,
    options: webMapOptions = {
      layerFilter: function () {
        return true;
      }
    },
    // @ts-ignore fix-mapoptions
    mapOptions: mapOptions = { style: { version: 8, sources: {}, layers: [] } }
  ) {
    super();

    this.mapId = id;
    if (options.map) {
      this.map = options.map;
      this._appendLayers = true;
    }
    this.options = {
      ...options,
      server: this._handleServerUrl(options.serverUrl || 'https://www.supermapol.com'),
      target: options.target || 'map',
      withCredentials: options.withCredentials || false,
      credentialKey: (options.accessKey && 'key') || (options.accessToken && 'token'),
      credentialValue: options.accessKey || options.accessToken,
      proj4
    };
    this.serverUrl = this.options.server;
    this.mapOptions = mapOptions;
    this.webMapEventTypes = [
      'mapinitialized',
      'mapcreatesucceeded',
      'mapcreatefailed',
      'layercreatefailed',
      'layeraddchanged',
      'baidumapnotsupport',
      'projectionnotmatch',
      'mapbeforeremove'
    ];
    this.selfEventTypes = ['addlayerssucceeded', 'layersupdated'];
    this.eventTypes = this.webMapEventTypes.concat(this.selfEventTypes);
    this._mapInitializedHandler = this._mapInitializedHandler.bind(this);
    this._mapCreateSucceededHandlerHandler = this._mapCreateSucceededHandlerHandler.bind(this);
    this._styleDataUpdatedHandler = this._styleDataUpdatedHandler.bind(this);
    this._mapBeforeRemoveHandler = this._mapBeforeRemoveHandler.bind(this);
    this._layerAddChangedHandler = this._layerAddChangedHandler.bind(this);
    this._initWebMap();
  }

  resize(keepBounds: boolean): void {
    this._handler.resize(keepBounds);
  }

  setCrs(crs: CRSOptions): void {
    this._handler.setCRS(crs);
  }

  setCenter(center: [number, number]): void {
    this._handler.setCenter(center);
  }

  setRenderWorldCopies(renderWorldCopies: boolean): void {
    this._handler.setRenderWorldCopies(renderWorldCopies);
  }

  setBearing(bearing: number): void {
    this._handler.setBearing(bearing);
  }

  setPitch(pitch: number): void {
    this._handler.setPitch(pitch);
  }

  setStyle(style: mapboxglTypes.Style): void {
    this._handler.setStyle(style);
  }

  setRasterTileSize(tileSize: number) {
    this._handler.setRasterTileSize(tileSize);
  }

  setZoom(zoom: number) {
    this._handler.setZoom(zoom);
  }

  setServerUrl(serverUrl: string): void {
    this.serverUrl = this._handleServerUrl(serverUrl);
    this._handler.setServerUrl(serverUrl);
  }

  setWithCredentials(withCredentials: boolean) {
    this.options.withCredentials = withCredentials;
    this._handler.setWithCredentials(withCredentials);
  }

  setProxy(proxy: string) {
    this._handler.setProxy(proxy);
  }

  setMapId(mapId: string | number): void {
    this._handler.setMapId(mapId);
  }

  getLayers() {
    return this.appreciableLayers;
  }

  getLegendInfo() {
    return this._handler.getLegends();
  }

  getLayerList() {
    return this.layerCatalogs;
  }

  protected cleanLayers() {
    this._handler.cleanLayers();
  }

  getLayerDatas(item) {
    const isGeojson = item.renderSource.type === 'geojson';
    if (isGeojson) {
      // @ts-ignore
      return Promise.resolve(this.map.getSource(item.renderSource.id).getData().features);
    } else {
      const dataId = item.dataSource.serverId;
      // TODO iserver服务也可获取要素
      if (!dataId) return [];
      let promise = new Promise((resolve, reject) => {
        const dataService = new iPortalDataService(
          `${this.serverUrl}web/datas/${dataId}`,
          this.options.withCredentials,
          { dataType: 'STRUCTUREDDATA' }
        );
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

  changeItemVisible(id: string, visible: boolean) {
    const item = this._findLayerCatalog(this.layerCatalogs, id);
    if (!item) {
      return;
    }
    const visibility = visible ? 'visible' : 'none';
    if (item.type === 'group') {
      const visbleId = this._getLayerVisibleId(item);
      this._appreciableLayersVisibleMap.set(visbleId, visible);
      const targetLayers = getGroupChildrenLayers(item.children);
      this.updateLayersVisible(targetLayers, visibility);
    } else {
      this.updateLayersVisible([item], visibility);
    }
  }

  updateLayersVisible(layers: Array<Record<string, any>>, visibility: 'visible' | 'none', ignoreIds: string[] = []) {
    layers.forEach(layer => {
      const visbleId = this._getLayerVisibleId(layer);
      this._appreciableLayersVisibleMap.set(visbleId, visibility === 'visible');
      if (
        (layer.CLASS_INSTANCE?.show || layer.CLASS_INSTANCE?.hide) &&
        !ignoreIds.some(id => id === layer.id)
      ) {
        visibility === 'visible' ? layer.CLASS_INSTANCE.show() : layer.CLASS_INSTANCE.hide();
        return;
      }
      layer.renderLayers.forEach((layerId: string) => {
        if (!ignoreIds.some(id => id === layerId) && (layer.CLASS_NAME !== 'L7Layer' || this.map.getLayer(layerId))) {
          this.map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      });
    });
    this._styleDataUpdatedHandler();
  }

  setLayersVisible(isShow: boolean, ignoreIds?: string[], onlyClear?: boolean) {
    // 只有 webmapv2 支持
    const visibility = isShow ? 'visible' : 'none';
    this._appreciableLayersVisibleMap.clear();
    if (!onlyClear) {
      const layers = this.cacheLayerIds.map(id => {
        const layer = this.map.getLayer(id);
        return {
          id,
          type: layer.type,
          renderLayers: [id]
        };
      });
      this.updateLayersVisible(layers, visibility, ignoreIds);
      return;
    }
    this._styleDataUpdatedHandler();
  }

  clean() {
    if (this.map) {
      this.map.off('styledata', this._styleDataUpdatedHandler);
      this._handler.clean();
    }
  }

  cleanWebMap() {
    this.clean();
  }

  updateOverlayLayer(layerInfo: any, features: any, mergeByField?: string) {
    this._handler.updateOverlayLayer(layerInfo, features, mergeByField);
  }

  copyLayer(id: string, layerInfo: Record<string, any>) {
    return this._handler.copyLayer(id, layerInfo);
  }

  get cacheLayerIds(): string[] {
    return this._cacheCleanLayers.reduce((ids, item) => ids.concat(item.renderLayers), []);
  }

  private _initWebMap(): void {
    this._createMap();
  }

  private _mapInitializedHandler({ map }) {
    this.map = map;
    this.triggerEvent('mapinitialized', { map: this.map });
    this.map.on('styledata', this._styleDataUpdatedHandler);
  }

  private _styleDataUpdatedHandler() {
    const layers = this._handler.getLayers() ?? [];
    const layerCatalogs = this._handler.getLayerCatalog() ?? [];
    const catalogIds = this._getCatalogVisibleIds(layerCatalogs);
    const visibleIds = Array.from(this._appreciableLayersVisibleMap.keys());
    const unsetKeys = difference(visibleIds, catalogIds);
    unsetKeys.forEach((item: string) => {
      this._appreciableLayersVisibleMap.delete(item);
    });
    this.appreciableLayers = layers.map(item => {
      return {
        ...item,
        visible: this._getLayerVisible(item)
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
      results.push(this._getLayerVisibleId(layer));
      const { children } = layer;
      if (children && children.length > 0) {
        const result = this._getCatalogVisibleIds(children);
        results.push(...result);
      }
    }
    return results;
  }

  private _mapCreateSucceededHandlerHandler(params: AddlayerssucceededParams) {
    const { mapparams, layers } = params;
    this.mapParams = mapparams;
    this._cacheCleanLayers = layers;
    this._styleDataUpdatedHandler();
    this.triggerEvent('addlayerssucceeded', params);
  }

  private _layerAddChangedHandler({ layers, allLoaded }) {
    this._cacheCleanLayers = layers;
    if (allLoaded) {
      this._styleDataUpdatedHandler();
    }
  }

  private _createMap() {
    const commonEvents = {
      ...this.webMapEventTypes.reduce((events, name) => {
        events[name] = (params: any) => {
          this.triggerEvent(name, params);
        };
        return events;
      }, {}),
      mapinitialized: this._mapInitializedHandler,
      mapcreatesucceeded: this._mapCreateSucceededHandlerHandler,
      layeraddchanged: this._layerAddChangedHandler,
      mapbeforeremove: this._mapBeforeRemoveHandler
    };
    this._handler = new mapboxgl.supermap.WebMap(this.mapId, this.options, this.mapOptions);
    for (const type in commonEvents) {
      this._handler.on(type, commonEvents[type]);
    }
  }

  private _mapBeforeRemoveHandler() {
    this.map.off('styledata', this._styleDataUpdatedHandler);
    this.triggerEvent('mapbeforeremove');
    this.map = null;
  }

  private _updateLayerCatalogsVisible(catalogs: Array<Record<string, any>>) {
    for (const data of catalogs) {
      data.visible = this._getLayerVisible(data);
      if (data.type === 'group') {
        this._updateLayerCatalogsVisible(data.children);
      }
    }
  }

  private _findLayerCatalog(catalogs: Array<Record<string, any>>, id: string) {
    let matchData: Record<string, any> | undefined;
    for (const data of catalogs) {
      if (data.id === id) {
        matchData = data;
        break;
      }
      if (data.type === 'group') {
        matchData = this._findLayerCatalog(data.children, id);
      }
    }
    return matchData;
  }

  private _getLayerVisible(layer: Record<string, any>) {
    const id = this._getLayerVisibleId(layer);
    return this._appreciableLayersVisibleMap.has(id) ? this._appreciableLayersVisibleMap.get(id) : layer.visible;
  }

  private _getLayerVisibleId(layer: Record<string, any>) {
    return `${layer.type}-${layer.id}`;
  }

  _handleServerUrl(serverUrl: string) {
    let urlArr: string[] = serverUrl.split('');
    if (urlArr[urlArr.length - 1] !== '/') {
      serverUrl += '/';
    }
    return serverUrl;
  }
}
