import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class UniqueThemeLayerViewModel extends mapboxgl.Evented {
  constructor(themeProps) {
    super();
    const { layerName, options, layerId, data } = themeProps;
    this.layerName = layerName || layerId;
    options.id = options.id || layerId;
    this.options = options;
    this.layerId = layerId;
    this.data = data || [];
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this._init();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.UniqueThemeLayer(this.layerName, this.options);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.data);
  }

  setOptions(options) {
    this.options = options;
    this.removed();
    this._init();
  }

  setData(data) {
    this.data = data;
    this.removed();
    this._init();
  }

  removed() {
    const { map, options } = this;
    const layerId = options.id;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
