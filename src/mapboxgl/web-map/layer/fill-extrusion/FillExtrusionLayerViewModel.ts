import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

export interface layerStyleParams {
  paint?: mapboxglTypes.FillExtrusionPaint;
  layout?: mapboxglTypes.FillExtrusionLayout;
}

export interface fillExtrusionOptionParams {
  layerId?: string;
  layerStyle?: layerStyleParams;
  sourceId?: string;
  sourceLayer?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
  [prop: string]: any;
}

export default class FillExtrusionViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  options: fillExtrusionOptionParams;
  _listenSourceDataFn: (data: mapboxglTypes.MapSourceDataEvent) => void;

  constructor(options?: fillExtrusionOptionParams) {
    super();
    this.options = options || {};
    this._listenSourceDataFn = this._listenSourceData.bind(this);
  }

  setMap(mapInfo: any) {
    const { map } = mapInfo;
    this.map = map;
    this._addLayer();
  }

  setLayerStyle(layerStyle: layerStyleParams) {
    if (!layerStyle || !this.map) {
      return;
    }
    this.options.layerStyle = layerStyle;
    this._udpateLayer();
  }

  setSourceId(sourceId: string) {
    if (!this.map || !this.map.getSource(sourceId)) {
      return;
    }
    this.options.sourceId = sourceId;
    const { layerId } = this.options;
    if (layerId && !this.map.getLayer(layerId)) {
      this._addLayer();
    } else {
      this.removed();
      this._addLayer();
    }
  }

  private _listenSourceData(data: mapboxglTypes.MapSourceDataEvent) {
    const { sourceId, layerId } = this.options;
    if (sourceId === data.sourceId && this.map.isSourceLoaded(data.sourceId) && !this.map.getLayer(layerId)) {
      this._addLayer();
    }
  }

  private _addLayer() {
    const { sourceId, data } = this.options;
    if (!this.map || data && !sourceId || sourceId && !this.map.getSource(sourceId)) {
      data && sourceId && this.map.on('sourcedata', this._listenSourceDataFn);
      return;
    }
    const { layerId, layerStyle, sourceLayer, filter, minzoom, maxzoom } = this.options;
    const { paint = {}, layout = {} } = layerStyle || {};
    const layer: mapboxglTypes.Layer = {
      id: layerId,
      source: sourceId || layerId,
      'source-layer': sourceLayer || '',
      type: 'fill-extrusion',
      paint: paint,
      layout: layout,
      filter: filter || ['==', '$type', 'Polygon'],
      minzoom,
      maxzoom
    };
    this.map.addLayer(layer);
    data && sourceId && this.map.off('sourcedata', this._listenSourceDataFn);
  }

  private _udpateLayer() {
    const { layerId, layerStyle } = this.options;
    const { paint = {}, layout = {} } = layerStyle || {};
    for (let paintName in paint) {
      this.map.setPaintProperty(layerId, paintName, paint[paintName]);
    }
    for (let layoutName in layout) {
      this.map.setLayoutProperty(layerId, layoutName, layout[layoutName]);
    }
  }

  removed(): void {
    const { layerId, data, sourceId } = this.options;
    if (this.map && layerId && this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
    }
    data && sourceId && this.map.off('sourcedata', this._listenSourceDataFn);
  }
}
