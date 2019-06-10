import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

export default class GeojsonLayerViewModel extends mapboxgl.Evented {
  constructor(map, GeojsonLayerOptions) {
    super();
    this.map = map;
    const { layerStyle, data, layerId } = GeojsonLayerOptions;
    this.data = data;
    this.layerStyle = layerStyle;
    this.layerId = layerId;
    this._addLayer();
  }

  _addLayer() {
    if (!(this.layerStyle instanceof Object)) throw new Error('layerStyle 不能为空');
    let { paint, layout } = this.layerStyle;
    this.map.addLayer({
      id: this.layerId,
      type: this._getLayerType(paint),
      source: {
        type: 'geojson',
        data: this.data
      },
      layout: layout || {},
      paint: paint || {}
    });
  }

  _getLayerType(paint = {}) {
    const keys = Object.keys(paint).join(' ');
    const reg = /circle-|line-|fill-extrusion-|fill-+/i;
    const matchType = keys.match(reg);
    const type = matchType ? matchType[0] : '';
    return type.substr(0, type.length - 1);
  }
}
