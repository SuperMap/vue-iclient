import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

interface LayerEnhance extends mapboxglTypes.Layer {
  serialize?: () => mapboxglTypes.Layer;
  beforeId?: string;
}
interface SourceEnhance extends mapboxglTypes.RasterSource {
  serialize?: () => SourceEnhance;
}

interface LayerItem {
  id: string;
  title: string;
  layers: LayerEnhance[];
  sources: Record<string, SourceEnhance>;
  thumbnail?: string;
}

interface LayerOnMapItem extends LayerItem {
  renderLayers?: Record<string, string>;
  renderSources?: Record<string, string>;
}

export default class BaseLayerSwitcherViewModel extends mapboxgl.Evented {
  private map: mapInfoType['map'];
  private webmap: mapInfoType['webmap'];
  private baseLayer?: LayerItem;
  private _currentBaseLayerInfo: LayerOnMapItem | null = null;
  fire: (type: string, params?: any) => void;
  on: (type: string, callback: () => void) => void;

  constructor() {
    super();
    this._onLayersUpdated = this._onLayersUpdated.bind(this);
  }

  setMap(mapInfo: mapInfoType) {
    const { map, webmap } = mapInfo;
    this.map = map;
    this.webmap = webmap;
    this.webmap.on({
      layerupdatechanged: this._onLayersUpdated
    });
    this._onLayersUpdated();
  }

  removed() {
    this._resetBaseLayer();
    this.map = null;
  }

  changeBaseLayer(layer: LayerItem) {
    if (this.webmap) {
      this.webmap.changeBaseLayer(layer);
      this._currentBaseLayerInfo = layer;
    }
  }

  private _onLayersUpdated() {
    if (!this.baseLayer) {
      this._initOriginBaseLayer();
    }
  }

  private _initOriginBaseLayer() {
    const appreciableLayers = this.webmap.getAppreciableLayers();
    const layerCatalog = this.webmap.getLayerList().slice();
    const baseLayerCatalog = layerCatalog.pop();
    const { layers: layerList, sources: sourcesMap } = this.map.getStyle();
    const baseLayers = this._getBaseLayerRenderLayers(baseLayerCatalog, appreciableLayers, layerList);
    const defaultBaseLayer = appreciableLayers[0];
    this.baseLayer = {
      id: `__default__${defaultBaseLayer.id}`,
      title: defaultBaseLayer.title,
      layers: baseLayers,
      sources: baseLayers.reduce((sources, layer) => {
        const sourceId = layer.source as unknown as string;
        const source = sourcesMap[sourceId];
        if (source) {
          sources[sourceId] = source;
        }
        return sources;
      }, {})
    };
    this._currentBaseLayerInfo = this.baseLayer;
    this.fire('baselayerchanged', this.baseLayer);
  }

  private _getBaseLayerRenderLayers(layerCatalog: any[], appreciableLayers: any[], layersOnMap: LayerEnhance[]): LayerEnhance[] {
    const uniqueSet = new Set();
    const collectIds = (node: Record<string, any>) => {
      if (node.children) {
        node.children.forEach((child: Record<string, any>) => collectIds(child));
      }
      node.renderLayers && node.renderLayers.forEach((part: string) => uniqueSet.add(part));
    };
    collectIds(layerCatalog);
    const layers = appreciableLayers.filter(layer => layer.renderLayers.some((id: string) => uniqueSet.has(id)));
    return layers.reduce((layerList, layer) => {
      const subLayers = layer.renderLayers.map((id: string) => Object.assign({}, layersOnMap.find(layer => layer.id === id)));
      return layerList.concat(subLayers);
    }, []);
  }

  private _resetBaseLayer() {
    if (this.baseLayer && this._currentBaseLayerInfo && this._currentBaseLayerInfo.id !== this.baseLayer.id) {
      this.changeBaseLayer(this.baseLayer);
    }
  }
}
