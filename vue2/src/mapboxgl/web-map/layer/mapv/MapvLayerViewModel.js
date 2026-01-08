import mapboxgl from 'mapbox-gl';
import { MapvLayer } from '@supermapgis/iclient-mapboxgl';

export default class MapvLayerViewModel extends mapboxgl.Evented {
  constructor(mapvLayerProps) {
    super();
    const { data, options, layerId } = mapvLayerProps;
    this.data = data;
    this.options = options.layerID ? options : { ...options, layerID: layerId };
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this._init();
  }

  setData(data) {
    this.data = data;
    this.removed();
    this._init();
  }

  setOptions(options) {
    this.options = options;
    this.removed();
    this._init();
  }

  _init() {
    if (this.data && this.options) {
      this._addMapvLayer();
    }
  }

  _addMapvLayer() {
    const mapVLayer = new MapvLayer(this.data, Object.assign({}, this.options));
    this.map && this.map.addLayer(mapVLayer);
  }

  removed() {
    const { map, options } = this;
    const layerId = options.layerID;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
