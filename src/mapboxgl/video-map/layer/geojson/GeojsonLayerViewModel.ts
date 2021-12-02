import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { videoMapParams } from '../../VideoMapViewModel';

export default class GeojsonLayerViewModel extends mapboxgl.Evented {
  videoMap: videoMapParams = null;
  data: any;
  layerId: string;
  layerStyle: any;
  geojsonLayer: Object;
  constructor(props) {
    super();
    const { data, layerStyle, layerId } = props;
    this.data = data;
    this.layerId = layerId;
    this.layerStyle = layerStyle;
  }

  setVideoMap({ videoMap }) {
    this.videoMap = videoMap;
    this.init();
  }

  init() {
    this.geojsonLayer = new SuperMap.GeojsonLayer(this.videoMap);
    this.data && this.add(this.data);
  }

  add(data) {
    if (!(this.layerStyle instanceof Object)) throw new Error('layerStyle 不能为空');
    let { paint, layout } = this.layerStyle;
    // @ts-ignore
    this.geojsonLayer.add({
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
    this.geojsonLayer.remove();
  }

  setData(data) {
    // @ts-ignore
    if (this.geojsonLayer.existed()) {
      // @ts-ignore
      this.geojsonLayer.setData(data);
    } else {
      // @ts-ignore
      this.add(data);
    }
  }

  setLayerStyle(layerStyle) {
    if (!this.videoMap) {
      return;
    }
    let { paint, layout } = layerStyle;
    this.layerStyle = layerStyle;
    if (paint) {
      for (let prop of Object.keys(paint)) {
        this.videoMap.setPaintProperty(this.layerId, prop, paint[prop]);
      }
    }
    if (layout) {
      for (let prop of Object.keys(layout)) {
        this.videoMap.setLayoutProperty(this.layerId, prop, layout[prop]);
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
