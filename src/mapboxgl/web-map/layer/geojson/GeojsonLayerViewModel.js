import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

export default class GeojsonLayerViewModel extends mapboxgl.Evented {
  constructor(GeojsonLayerOptions) {
    super();
    const { layerStyle, data, layerId } = GeojsonLayerOptions;
    this.data = data;
    this.layerStyle = layerStyle;
    this.layerId = layerId;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this._addLayer();
  }

  setData(data) {
    if (!data || !this.map.getSource(this.layerId)) {
      return;
    }
    this.data = data;
    if (this.layerId && !this.map.getSource(this.layerId)) {
      this._addLayer();
    } else {
      this.map.getSource(this.layerId).setData(data);
    }
  }

  setLayerStyle(layerStyle) {
    if (!layerStyle || !this.map.getSource(this.layerId)) {
      return;
    }

    let { paint, layout } = layerStyle;
    for (let prop of Object.keys(paint)) {
      this.map.setPaintProperty(this.layerId, prop, paint[prop]);
    }
    for (let prop of Object.keys(layout)) {
      this.map.setLayoutProperty(this.layerId, prop, layout[prop]);
    }

    this.layerStyle = layerStyle;
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

  removed() {
    const { map, layerId } = this;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
