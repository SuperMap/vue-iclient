import type mapboxglTypes from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import cloneDeep from 'lodash.clonedeep';

interface LayerEnhance extends mapboxglTypes.Layer {
  metadata?: Record<string, any>;
  renderLayers?: string[];
  serialize?: () => mapboxglTypes.Layer;
  beforeId?: string;
}

interface BaseLayerItem {
  id: string;
  title: string;
  layers: LayerEnhance[];
  sources: Record<string, any>;
  thumbnail?: string;
  [key: string]: any;
}

interface LayerCatalogItem {
  id: string;
  title: string;
  renderLayers?: string[];
  children?: LayerCatalogItem[];
  [key: string]: any;
}

interface WebMapLike {
  on: (listeners: Record<string, (...args: any[]) => void>) => void;
  un: (listeners: Record<string, (...args: any[]) => void>) => void;
  getAppreciableLayers: () => LayerEnhance[];
  getLayerList: () => LayerCatalogItem[];
  changeBaseLayer: (layer: BaseLayerItem) => void;
}

interface MapInfo {
  map: mapboxglTypes.Map;
  webmap: WebMapLike;
}

/** Manages selection and restoration of a map's base layer. */
export default class BaseLayerSwitcherViewModel extends mapboxgl.Evented {
  private map: mapboxglTypes.Map;
  private webmap: WebMapLike;
  private baseLayer?: BaseLayerItem;
  private currentBaseLayerInfo: BaseLayerItem | null = null;

  constructor() {
    super();
    this.onLayersUpdated = this.onLayersUpdated.bind(this);
  }

  setMap(mapInfo: MapInfo): void {
    const { map, webmap } = mapInfo;
    this.map = map;
    this.webmap = webmap;
    this.webmap.on({ layerupdatechanged: this.onLayersUpdated });
    this.onLayersUpdated();
  }

  removed(): void {
    this.resetBaseLayer();
    this.webmap?.un({ layerupdatechanged: this.onLayersUpdated });
    this.map = null;
    this.webmap = null;
    this.baseLayer = null;
    this.currentBaseLayerInfo = null;
  }

  changeBaseLayer(layer: BaseLayerItem): void {
    if (!this.webmap || !layer) {
      return;
    }
    const nextLayer: BaseLayerItem = {
      ...layer,
      layers: layer.layers.map(item => ({
        ...item,
        metadata: {
          ...item.metadata,
          title: item.metadata?.title || layer.title
        }
      }))
    };
    this.webmap.changeBaseLayer(nextLayer);
    this.currentBaseLayerInfo = layer;
  }

  setBaseTitle(title: string, changeBaseLayer: boolean): void {
    if (!this.baseLayer) {
      return;
    }
    const nextBaseLayer = cloneDeep(this.baseLayer);
    nextBaseLayer.title = title || this.baseLayer.title;
    if (nextBaseLayer.layers.length === 1) {
      nextBaseLayer.layers[0].metadata = nextBaseLayer.layers[0].metadata || {};
      nextBaseLayer.layers[0].metadata.title = title || this.baseLayer.layers[0].metadata?.title;
    }
    if (changeBaseLayer) {
      this.changeBaseLayer(nextBaseLayer);
    }
    this.fire('baselayerchanged', { baseLayer: nextBaseLayer });
  }

  private onLayersUpdated(): void {
    if (!this.baseLayer && this.map) {
      this.initOriginBaseLayer();
    }
  }

  private initOriginBaseLayer(): void {
    const mapStyle = this.map.getStyle();
    if (!mapStyle || !mapStyle.layers?.length) {
      return;
    }
    const layerList = mapStyle.layers as LayerEnhance[];
    const sourcesMap = mapStyle.sources;
    const appreciableLayers = this.webmap.getAppreciableLayers();
    const layerCatalog = this.webmap.getLayerList().slice();
    const baseLayerCatalog = layerCatalog.pop();
    if (!baseLayerCatalog) {
      return;
    }
    const baseLayers = this.getBaseLayerRenderLayers(baseLayerCatalog, appreciableLayers, layerList);
    this.baseLayer = {
      id: `__default__${baseLayerCatalog.id}`,
      title: baseLayerCatalog.title,
      layers: baseLayers,
      sources: baseLayers.reduce((sources, layer) => {
        const sourceId = layer.source as string;
        const source = sourcesMap[sourceId];
        if (source) {
          sources[sourceId] = source;
        }
        return sources;
      }, {} as Record<string, any>)
    };
    this.currentBaseLayerInfo = this.baseLayer;
    this.fire('baselayerchanged', { baseLayer: this.baseLayer });
  }

  private getBaseLayerRenderLayers(
    layerCatalog: LayerCatalogItem,
    appreciableLayers: LayerEnhance[],
    layersOnMap: LayerEnhance[]
  ): LayerEnhance[] {
    const renderLayerIds = new Set<string>();
    const collectIds = (node: LayerCatalogItem): void => {
      node.children?.forEach(collectIds);
      node.renderLayers?.forEach(id => renderLayerIds.add(id));
    };
    collectIds(layerCatalog);

    const baseLayers = appreciableLayers.filter(layer => layer.renderLayers?.some(id => renderLayerIds.has(id)));
    return baseLayers.reduce((result, layer) => {
      const subLayers = (layer.renderLayers || []).map(id => {
        const layerInfo: LayerEnhance = Object.assign({}, layersOnMap.find(item => item.id === id));
        layerInfo.metadata = {
          ...layerInfo.metadata,
          title: layerInfo.metadata?.title || (layer as any).title
        };
        return layerInfo;
      });
      return result.concat(subLayers);
    }, [] as LayerEnhance[]);
  }

  private resetBaseLayer(): void {
    if (this.baseLayer && this.currentBaseLayerInfo) {
      this.changeBaseLayer(this.baseLayer);
    }
  }
}
