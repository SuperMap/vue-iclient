import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient10-mapboxgl.min';

export default class MapvLayerViewModel extends mapboxgl.Evented {
  constructor(map, mapvLayerProps) {
    super();
    this.map = map;
    const { data, options, layerId } = mapvLayerProps;
    this.data = data;
    this.options = options.layerId ? options : { ...options, layerId };
    this._init();
  }

  _init() {
    if (this.data && this.options) {
      this._addMapvLayer();
    }
  }

  _addMapvLayer() {
    const mapVLayer = new mapboxgl.supermap.MapvLayer('', this.data, this.options);
    this.map.addLayer(mapVLayer);
  }
}
