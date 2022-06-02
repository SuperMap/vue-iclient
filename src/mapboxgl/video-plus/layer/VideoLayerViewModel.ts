import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import { featureEach, coordEach } from '@turf/meta';
import cloneDeep from 'lodash.clonedeep';

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
    const { map } = videoPlus;
    this.map = map;
    this.videoPlus = videoPlus;
    this.data && this.add(this.data);
  }

  add(data) {
    if (!(this.layerStyle instanceof Object)) throw new Error('layerStyle 不能为空');
    let { paint, layout } = this.layerStyle;
    // @ts-ignore
    let layer = {
      id: this.layerId,
      type: this._getLayerType(paint),
      source: {
        type: 'geojson',
        data: data
      },
      layout: layout || {},
      paint: paint || {}
    };

    if (this.existed()) {
      return;
    }
    const newData = this.eachData(cloneDeep(layer.source.data));
    this.cacheData = layer.source.data;
    layer.source.data = newData;
    this.map.addLayer(layer);
  }

  existed() {
    return !!(this.layerId && this.map.getLayer(this.layerId));
  }

  removed() {
    // @ts-ignore
    this.layerId && this.map.removeLayer(this.layerId);
  }

  setData(data) {
    if (data.features) {
      this.cacheData = data;
    }
    const newData = this.eachData(cloneDeep(this.cacheData));
    this.map.getSource(this.layerId).setData(newData);
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

  eachData(features) {
    featureEach(features, (currentFeature) => {
      // @ts-ignore
      coordEach(currentFeature, (curCoords) => {
        let transCoords = cloneDeep(curCoords);
        curCoords.length = 0;
        if (transCoords.length) {
          curCoords.push(
            ...this.videoPlus.transformPointToLatLng(transCoords)
          );
        }
      });
    });
    return features;
  }

  _getLayerType(paint = {}) {
    const keys = Object.keys(paint).join(' ');
    const reg = /circle-|line-|fill-extrusion-|fill-+/i;
    const matchType = keys.match(reg);
    const type = matchType ? matchType[0] : '';
    return type.substr(0, type.length - 1);
  }
}
