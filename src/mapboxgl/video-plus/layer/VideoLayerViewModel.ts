import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

export default class VideoLayerViewModel extends mapboxgl.Evented {
  videoPlus: any;
  data: any;
  layerId: string;
  layerStyle: any;
  constructor(props) {
    super();
    const { data, layerStyle, layerId } = props;
    this.data = data;
    this.layerId = layerId;
    this.layerStyle = layerStyle;
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.data && this.add(this.data);
  }

  add(data) {
    if (!(this.layerStyle instanceof Object)) throw new Error('layerStyle 不能为空');
    let { paint, layout } = this.layerStyle;
    if (!(this.layerId && this.videoPlus.getLayer(this.layerId))) {
      return;
    }
    this.videoPlus.addLayer({
      id: this.layerId,
      type: this._getLayerType(paint),
      source: {
        type: 'geojson',
        data: data
      },
      layout: layout || {},
      paint: paint || {}
    });
  }

  removed() {
    // @ts-ignore
    this.layerId && this.videoPlus.removeLayer(this.layerId);
  }

  setData(data) {
    this.videoPlus.setData(this.layerId, data);
  }

  setLayerStyle(layerStyle) {
    if (!this.videoPlus) {
      return;
    }
    let { paint, layout } = layerStyle;
    this.layerStyle = layerStyle;
    if (paint) {
      for (let prop of Object.keys(paint)) {
        this.videoPlus.setPaintProperty(this.layerId, prop, paint[prop]);
      }
    }
    if (layout) {
      for (let prop of Object.keys(layout)) {
        this.videoPlus.setLayoutProperty(this.layerId, prop, layout[prop]);
      }
    }
  }

  _getLayerType(paint = {}) {
    const keys = Object.keys(paint).join(' ');
    const reg = /circle-|line-|fill-extrusion-|fill-+/i;
    const matchType = keys.match(reg);
    const type = matchType ? matchType[0] : '';
    return type.substr(0, type.length - 1);
  }
}
