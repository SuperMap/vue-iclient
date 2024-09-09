import { Events } from 'vue-iclient/src/common/_types/event/Events';
import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import SourceListModel from 'vue-iclient/src/mapboxgl/web-map/SourceListModel';
import WebMapService from '../../common/_utils/WebMapService';
import cloneDeep from 'lodash.clonedeep';

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
  name?: string;
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
  crs?: string | { epsgCode: string; WKT: string; extent: any; unit: string };
  transformRequest?: (url: string, resourceType: string) => void;
  fadeDuration?: number;
}

export default class MapStyle extends Events {
  options: webMapOptions;
  mapOptions: mapOptions;
  target: string;
  proxy: string | boolean;
  map: mapboxglTypes.Map;
  layerFilter: Function;
  withCredentials: boolean;
  eventTypes: string[];
  private _sourceListModel: InstanceType<typeof SourceListModel>;
  protected webMapService: InstanceType<typeof WebMapService>;
  _layerIdRenameMapList: any[] = [];
  _appendLayers = false;

  triggerEvent: (name: string, ...rest: any) => any;

  on: (data: Record<string, Function>) => void;

  constructor(
    id: string | number | Object,
    options: webMapOptions,
    mapOptions: mapOptions,
    layerFilter: Function
  ) {
    super();
    this.target = options.target || 'map';
    this.options = options;
    this.proxy = options.proxy;
    this.withCredentials = options.withCredentials || false;
    this.mapOptions = cloneDeep(mapOptions);
    this.webMapService = new WebMapService(id, options);
    this.layerFilter = layerFilter;
    this.eventTypes = ['addlayerssucceeded', 'mapinitialized'];
  }

  initializeMap(_: Record<string, any>, map?: mapboxglTypes.Map) {
    if (map) {
      this._appendLayers = true;
      this.map = map;
      this._addLayersToMap();
      return;
    }
    this.mapOptions.container = this.target;
    if (typeof this.mapOptions.crs === 'object' && this.mapOptions.crs.epsgCode) {
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
            : undefined
        };
      };
    }
    this.mapOptions.center = this.mapOptions.center ?? [0, 0];
    this.mapOptions.zoom = this.mapOptions.zoom ?? 0;
    let fadeDuration = 0;
    if (Object.prototype.hasOwnProperty.call(this.mapOptions, 'fadeDuration')) {
      fadeDuration = this.mapOptions.fadeDuration;
    }
    this.map = new mapboxgl.Map({ ...this.mapOptions, fadeDuration });
    this.triggerEvent('mapinitialized', { map: this.map });
    this.map.on('load', () => {
      this._sendMapToUser();
    });
  }

  _addLayersToMap() {
    const { sources, layers, layerIdMapList } = this._setUniqueId(this.mapOptions.style);
    layers.forEach(layer => {
      layer.source && !this.map.getSource(layer.source) && this.map.addSource(layer.source, sources[layer.source]);
      this.map.addLayer(layer);
    });
    this._layerIdRenameMapList = layerIdMapList;
    this._sendMapToUser();
  }

  _setUniqueId(style: Record<string, any>) {
    const layersToMap = JSON.parse(JSON.stringify(style.layers));
    const nextSources = {};
    const layerIdToChange = [];
    const timestamp = `_${+new Date()}`;
    for (const sourceId in style.sources) {
      let nextSourceId = sourceId;
      if (this.map.getSource(sourceId)) {
        nextSourceId = sourceId + timestamp;
      }
      nextSources[nextSourceId] = style.sources[sourceId];
      for (const layer of layersToMap) {
        if (layer.source === sourceId) {
          layer.source = nextSourceId;
        }
      }
    }
    for (const layer of layersToMap) {
      const originId = layer.id;
      if (this.map.getLayer(layer.id)) {
        const layerId = layer.id + timestamp;
        layer.id = layerId;
      }
      layerIdToChange.push({ originId: originId, renderId: layer.id });
    }
    return {
      sources: nextSources,
      layers: layersToMap,
      layerIdMapList: layerIdToChange
    };
  }

  _generateAppreciableLayers() {
    const layers = this.mapOptions.style.layers.map((layer: Record<string, any>) => {
      const matchLayer = this._layerIdRenameMapList.find(item => item.originId === layer.id) || { renderId: layer.id };
      const overlayLayers = {
        id: matchLayer.renderId,
        name: layer.id
      };
      return overlayLayers;
    });
    return layers;
  }

  _sendMapToUser() {
    const layersOnMap = this._generateAppreciableLayers();
    this._sourceListModel = new SourceListModel({
      map: this.map,
      layers: layersOnMap,
      appendLayers: this._appendLayers
    });
    const matchLayers = this.getAppreciableLayers().filter((item: Record<string, any>) =>
      layersOnMap.some((layer: Record<string, any>) => item.renderLayers.includes(layer.id))
    );
    this.triggerEvent('addlayerssucceeded', {
      map: this.map,
      mapparams: { title: this.mapOptions.name, description: '' },
      layers: matchLayers
    });
  }

  clean() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this._sourceListModel = null;
    }
  }

  getLayerCatalog() {
    return this._sourceListModel?.getSourceList() ?? [];
  }

  getLegendInfo() {
    return [];
  }

  getAppreciableLayers() {
    return this._sourceListModel?.getLayers() ?? [];
  }
}
