import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from 'vue-iclient/src/mapboxgl/web-map/SourceListModel';
import cloneDeep from 'lodash.clonedeep';

export interface layerStyleParams {
  paint?: mapboxglTypes.FillExtrusionPaint;
  layout?: mapboxglTypes.FillExtrusionLayout;
}

export interface fillExtrusionLayerParams {
  layerId?: string;
  sourceId?: string;
  layerStyle?: layerStyleParams;
  sourceLayer?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
}

export interface sourceListParams {
  id: string;
  layers: mapboxglTypes.Layer[];
  sourceLayers: {
    [prop: string]: mapboxglTypes.Layer[];
  };
}

interface geoJSONSource extends mapboxglTypes.GeoJSONSource {
  getData(): GeoJSON.FeatureCollection<GeoJSON.Geometry>;
}

interface layeEnhanceParams extends mapboxglTypes.Layer {
  serialize?: () => mapboxglTypes.Layer;
}

interface showLayerParam {
  value: string;
  layerId: string;
  fillExtrusionLayerIdList: string[];
  source: string;
  sourceLayer: string;
}

export default class FillExtrusionViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  setMap(mapInfo: mapInfoType) {
    const { map } = mapInfo;
    this.map = map;
  }

  getLayer(layerId: string): mapboxglTypes.Layer {
    if (!this.map || !layerId) {
      return null;
    }
    const layer: layeEnhanceParams = this.map.getLayer(layerId);
    const nextLayer: mapboxglTypes.Layer = cloneDeep(layer.serialize());
    return nextLayer;
  }

  getLayerFields(sourceId: string): GeoJSON.GeoJsonProperties {
    if (!this.map) {
      return null;
    }
    const source = <geoJSONSource> this.map.getSource(sourceId);
    if (!source || !source.getData) {
      return null;
    }
    const featureCollecctions = source.getData();
    return featureCollecctions && ((featureCollecctions.features || [])[0] || {}).properties;
  }

  getSourceOption(source: any, sourceLayer: string, map?: mapboxglTypes.Map): sourceListParams {
    if (!map && !this.map) {
      return null;
    }
    if (map && !this.map) {
      this.map = map;
    }
    let selectedSourceModel = typeof source === 'object' && source;
    if (!selectedSourceModel && typeof source === 'string') {
      const sourceList = this._getSourceList();
      selectedSourceModel = sourceList[source];
    }
    const sourceData = selectedSourceModel && this._getSourceLayers(selectedSourceModel, sourceLayer);
    return sourceData;
  }

  toggleShowCorrespondingLayer(data: showLayerParam): void {
    if ((!data && !data.source && !data.sourceLayer) || !this.map) {
      return;
    }
    const sourceList = this._getSourceList();
    const sourceInfo = sourceList[data.source];
    if (sourceInfo && sourceInfo.layers.length > 0) {
      sourceInfo.layers.forEach((layer: any) => {
        let filterCondition = layer.source === data.source;
        if (data.sourceLayer) {
          filterCondition = layer.sourceLayer === data.sourceLayer;
        }
        if (
          filterCondition &&
          (layer.id === data.layerId || (!data.fillExtrusionLayerIdList.includes(layer.id) && layer.type !== 'fill'))
        ) {
          this.map.setLayoutProperty(layer.id, 'visibility', data.value);
        }
      });
    }
  }

  private _getSourceList() {
    const sourceListModel = new SourceListModel({
      map: this.map
    });
    const sourceList = sourceListModel.getSourceList();
    return sourceList;
  }

  private _getSourceLayers(sourceModel: any, sourceLayer: string): sourceListParams {
    let layers = null;
    const sourceLayers = sourceModel.sourceLayerList ? {} : null;
    const layerList = sourceLayers && sourceLayer ? sourceModel.sourceLayerList[sourceLayer] : sourceModel.layers;
    layerList.forEach((item: mapboxglTypes.Layer) => {
      if (item.type === 'fill') {
        layers = layers || [];
        const layer: layeEnhanceParams = this.map.getLayer(item.id);
        const nextLayer: mapboxglTypes.Layer = cloneDeep(layer.serialize());
        layers.push(nextLayer);
        if (sourceLayers) {
          // @ts-ignore
          const sourceLayerName = item.sourceLayer;
          if (!sourceLayers[sourceLayerName]) {
            sourceLayers[sourceLayerName] = [];
          }
          sourceLayers[sourceLayerName].push(nextLayer);
        }
      }
    });
    return {
      id: sourceModel.id,
      layers,
      sourceLayers
    };
  }
}
