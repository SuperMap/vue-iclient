import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class MapvLayerViewModel extends mapboxgl.Evented {
  constructor(map, mapvLayerProps) {
    super();
    this.map = map;
    const { data, options, layerId } = mapvLayerProps;
    this.data = data;
    this.options = options.layerID ? options : { ...options, layerID: layerId };
    this._init();
  }

  _init() {
    if (this.data && this.options) {
      this._addMapvLayer();
    }
  }

  _addMapvLayer() {
    const mapVLayer = new mapboxgl.supermap.MapvLayer('', this.data, Object.assign({}, this.options));
    this.map.addLayer(mapVLayer);
  }

  clear() {
    const { map, options } = this;
    const layerId = options.layerID;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
