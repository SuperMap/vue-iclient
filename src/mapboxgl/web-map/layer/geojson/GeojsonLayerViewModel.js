import WidgetViewModel from '../../../_types/WidgetViewModel';

export default class GeojsonLayerViewModel extends WidgetViewModel {
  constructor(map, GeojsonLayerOptions) {
    super(map);
    const { layerStyle, data, layerId } = GeojsonLayerOptions;
    this.data = data;
    this.layerStyle = layerStyle;
    this.layerId = layerId;
    this._addLayer();
  }

  _addLayer() {
    let type = this._transformType(this.data.features[0].geometry.type);
    let { paint, layout } = this.layerStyle;
    this.map.addLayer({
      id: this.layerId,
      type,
      source: {
        type: 'geojson',
        data: this.data
      },
      layout,
      paint
    });
  }

  _transformType(type) {
    return {
      Point: 'circle',
      Polygon: 'fill',
      LineString: 'line',
      MultiPolygon: 'fill'
    }[type];
  }
}
