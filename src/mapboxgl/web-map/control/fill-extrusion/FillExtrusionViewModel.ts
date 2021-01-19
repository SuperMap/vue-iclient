import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from '../../SourceListModel';

export interface layerStyleParams {
  paint?: mapboxglTypes.FillExtrusionPaint;
  layout?: mapboxglTypes.FillExtrusionLayout;
}

export interface fillExtrusionLayerParams {
  layerId?: string;
  sourceId?: mapboxglTypes.Style | GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry> | string;
  layerStyle?: layerStyleParams;
  sourceLayer?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
}

export interface sourceLayerListParams {
  [prop: string]: mapboxglTypes.Layer[];
}

interface geoJSONSource extends mapboxglTypes.GeoJSONSource {
  getData(): GeoJSON.FeatureCollection<GeoJSON.Geometry>;
}

export default class FillExtrusionViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  sourceLayerList: sourceLayerListParams;
  _initSourceListFn: (data: mapboxglTypes.MapStyleDataEvent) => void;
  fire: any;

  constructor() {
    super();
    this.sourceLayerList = {};
    this._initSourceListFn = this._initSourceList.bind(this);
  }

  setMap(mapInfo: any) {
    const { map } = mapInfo;
    this.map = map;
    this._initSourceList();
    this.map.on('styledata', this._initSourceListFn);
  }

  getLayerFields(sourceId: string): Object {
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

  getLayer(layerId: string): mapboxglTypes.Layer {
    return this.map.getLayer(layerId);
  }

  getFillColorOfLayer(layerId: string): any {
    if (!layerId) {
      return null;
    }
    return this.map.getPaintProperty(layerId, 'fill-color');
  }

  private _getSourceList() {
    const sourceListModel = new SourceListModel({
      map: this.map
    });
    const sourceList = sourceListModel.getSourceList();
    return sourceList;
  }

  private _getSourceLayers(sourceModel: any) {
    let layers = null;
    sourceModel.layers.forEach((item: mapboxglTypes.Layer) => {
      if (item.type === 'fill') {
        layers = layers || [];
        layers.push(Object.assign({}, item));
      }
    });
    return layers;
  }

  private _initSourceList(): void {
    const sourceList = this._getSourceList();
    const sourceLayerList = {};
    for (let name in sourceList) {
      const source = sourceList[name];
      const layers = this._getSourceLayers(source);
      layers && (sourceLayerList[source.id] = layers);
    }
    this.sourceLayerList = sourceLayerList;
    this.fire('sourcesupdated', { sourceLayerList });
  }

  removed(): void {
    this.sourceLayerList = {};
    this.map.off('styledata', this._initSourceListFn);
  }
}
