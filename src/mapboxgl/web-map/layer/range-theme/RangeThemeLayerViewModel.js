import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class RangeThemeLayerViewModel extends mapboxgl.Evented {
  constructor(map, themeProps) {
    super();
    const { layerName, options, layerId, data } = themeProps;
    this.map = map;
    this.layerName = layerName || layerId;
    options.id = options.id || layerId;
    this.options = options;
    this.layerId = layerId;
    this.data = data || [];
    this._init();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.RangeThemeLayer(this.layerName, this.options);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.data);
  }

  clear() {
    const { map, options } = this;
    const layerId = options.id;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
