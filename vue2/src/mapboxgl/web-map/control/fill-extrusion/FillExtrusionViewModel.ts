import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
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
    const source = <geoJSONSource>this.map.getSource(sourceId);
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
      selectedSourceModel = sourceList.find((item: Record<string, any>) => item.renderSource.id === source);
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
    const sourceListModel = new mapboxgl.supermap.SourceListModelV2({
      map: this.map,
      layers: []
    });
    const sourceList = sourceListModel.getSourceList();
    return sourceList;
  }

  private findSourceLayerIds(sourceModel: Record<string, any>, sourceLayer: string) {
    if (sourceModel.renderSource.sourceLayer === sourceLayer) {
      return sourceModel.renderLayers;
    }
    if (sourceModel.children?.length > 0) {
      for (const data of sourceModel.children) {
        const res = this.findSourceLayerIds(data, sourceLayer);
        if (res) {
          return res;
        }
      }
    }
  }

  private _getSourceLayers(sourceModel: any, sourceLayer: string): sourceListParams {
    const sourceLayerIds = this.findSourceLayerIds(sourceModel, sourceLayer);
    const sourceLayers =
      sourceLayerIds &&
      sourceLayerIds
        .map((item: string) => this.map.getLayer(item))
        .filter((item: Record<string, any>) => item.type === 'fill')
        .map((item: Record<string, any>) => cloneDeep(item).serialize());
    const layerIds = sourceLayerIds || sourceModel.renderLayers;
    const layerList = layerIds
      .map((item: string) => this.map.getLayer(item))
      .filter((item: Record<string, any>) => item.type === 'fill')
      .map((item: Record<string, any>) => cloneDeep(item).serialize());
    return {
      id: sourceModel.id,
      layers: layerList,
      sourceLayers
    };
  }
}
