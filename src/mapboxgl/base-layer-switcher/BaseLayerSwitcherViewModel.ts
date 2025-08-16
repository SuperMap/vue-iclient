import cloneDeep from 'lodash.clonedeep';
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
    this.webmap = null;
    this.baseLayer = null;
  }

  changeBaseLayer(layer: LayerItem) {
    if (this.webmap && layer) {
      const nextLayer: LayerItem = {
        ...layer,
        layers: layer.layers.map(item => {
          return {
            ...item,
            metadata: {
              ...item.metadata,
              title: item.metadata?.title || layer.title
            }
          };
        })
      };
      this.webmap.changeBaseLayer(nextLayer);
      this._currentBaseLayerInfo = layer;
    }
  }

  setBaseTitle(title: string, changeBaseLayer: boolean) {
    if (this.baseLayer) {
      const nextBaseLayer = cloneDeep(this.baseLayer);
      nextBaseLayer.title = title || this.baseLayer.title;
      if (nextBaseLayer.layers.length === 1) {
        nextBaseLayer.layers[0].metadata.title = title || this.baseLayer.layers[0].metadata.title;
      }
      changeBaseLayer && this.changeBaseLayer(nextBaseLayer);
      this.fire('baselayerchanged', { baseLayer: nextBaseLayer });
    }
  }

  private _onLayersUpdated() {
    if (!this.baseLayer && this.map) {
      this._initOriginBaseLayer();
    }
  }

  private _initOriginBaseLayer() {
    const mapStyle = this.map.getStyle();
    if (!mapStyle) {
      return;
    }
    const { layers: layerList, sources: sourcesMap } = mapStyle;
    if (layerList.length === 0) {
      return;
    }
    const appreciableLayers = this.webmap.getAppreciableLayers();
    const layerCatalog = this.webmap.getLayerList().slice();
    const baseLayerCatalog = layerCatalog.pop();
    const baseLayers = this._getBaseLayerRenderLayers(baseLayerCatalog, appreciableLayers, layerList);
    this.baseLayer = {
      id: `__default__${baseLayerCatalog.id}`,
      title: baseLayerCatalog.title,
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
    this.fire('baselayerchanged', { baseLayer: this.baseLayer });
  }

  private _getBaseLayerRenderLayers(
    layerCatalog: Record<string, any>,
    appreciableLayers: any[],
    layersOnMap: LayerEnhance[]
  ): LayerEnhance[] {
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
      const subLayers = layer.renderLayers.map((id: string) => {
        const layerInfo = Object.assign(
          {},
          layersOnMap.find(layer => layer.id === id)
        );
        layerInfo.metadata = {
          ...layerInfo.metadata,
          title: layerInfo.metadata?.title || layer.title
        };
        return layerInfo;
      });
      return layerList.concat(subLayers);
    }, []);
  }

  private _resetBaseLayer() {
    if (this.baseLayer && this._currentBaseLayerInfo) {
      this.changeBaseLayer(this.baseLayer);
    }
  }
}
