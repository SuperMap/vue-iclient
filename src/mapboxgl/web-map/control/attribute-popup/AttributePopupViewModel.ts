import type mapboxglTypes from 'mapbox-gl';
import type {
  HighlightLayerOptions,
  CreateRelatedDatasParams
} from 'vue-iclient/src/mapboxgl/layer-highlight/LayerHighlightViewModel';
import LayerHighlightViewModel, { DataSelectorMode } from 'vue-iclient/src/mapboxgl/layer-highlight/LayerHighlightViewModel';
import uniqBy from 'lodash.uniqby';

export default class AttributePopupViewModel extends LayerHighlightViewModel {
  private e: mapboxglTypes.MapLayerMouseEvent
  clickedFeatures: { [layerId: string]: any[] } = {}

  constructor(options: HighlightLayerOptions) {
    super(options);
    this.handleMapClick = this.handleMapClickCover.bind(this);
    this.saveClickedFeatures();
  }

  async handleMapClickCover(e: mapboxglTypes.MapLayerMouseEvent) {
    this.activeTargetId = this.dataSelectorMode === DataSelectorMode.MULTIPLE ? this.activeTargetId : null;
    const layers = this.activeTargetId
      ? [this.activeTargetId]
      : this.highlightOptions.layerIds.filter(item => !!this.map.getLayer(item));
    this.removeHighlightLayers();
    // @ts-ignore
    const features = await this.queryLayerFeatures(e as mapboxglTypes.MapLayerMouseEvent, layers);
    this.getClickedLayers(features, e);
    this.e = e;
  }

  private getClickedLayers(features: any[], e: mapboxglTypes.MapLayerMouseEvent) {
    const layers = features.map(item => item.layer);
    this.fire('layerclick', {
      layers: uniqBy(layers, 'id'),
      lngLat: e.lngLat,
      isMultipleClick: Boolean(this.dataSelectorMode !== DataSelectorMode.SINGLE),
      isSecMultipleClick: Boolean(
        this.dataSelectorMode !== DataSelectorMode.SINGLE && this.activeTargetId
      )
    });
    return layers;
  }

  async queryFeaturesByLayerId(layerId: string) {
    if (!layerId) return;
    const features = await this.queryLayerFeatures(this.e, [layerId]);
    if (this.dataSelectorMode !== DataSelectorMode.MULTIPLE) {
      this.dataSelectorMode = DataSelectorMode.SINGLE;
    }
    this.activeTargetId = this.dataSelectorMode === DataSelectorMode.MULTIPLE ? layerId : null;
    this.handleMapSelections(features);
  }

  saveClickedFeatures() {
    this.on('mapselectionchanged', (e: any) => {
      const features = e.features;
      const isMultiple = this.dataSelectorMode !== DataSelectorMode.SINGLE;
      if (features[0]) {
        const layerId = features[0].layer.id;
        if (isMultiple) {
          const savedFeatures = this.clickedFeatures[layerId] || [];
          this.clickedFeatures[layerId] = savedFeatures.concat(features);
        } else {
          this.clickedFeatures[layerId] = features;
        }
      }
      if (!features[0] && isMultiple && this.activeTargetId) {
        delete this.clickedFeatures[this.activeTargetId];
      }
    });
  }

  setHighlightLayerFilter(
    layerId: string,
    identifyFields: { field: string; values: any[] },
    isMultiple = true
  ) {
    const layer = this.map.getLayer(layerId);
    const highlightLayers = this.getHighlightLayerIds([layerId]);
    const features = (this.clickedFeatures[layerId] || []).filter(item => {
      const value = item.properties[identifyFields.field];
      return identifyFields.values.includes(value);
    });
    // @ts-ignore
    if (layer?.l7layer) {
      this.setL7Filter(layer, features);
      return;
    }
    const params: CreateRelatedDatasParams = {
      features,
      targetId: layerId,
      isMultiple
    };
    const filterExps = this.createFilterExps(params);
    highlightLayers.forEach(item => {
      this.map.setFilter(item, filterExps);
    });
  }
}
