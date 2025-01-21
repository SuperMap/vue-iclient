import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class GraphThemeLayerViewModel extends mapboxgl.Evented {
  constructor(themeProps) {
    super();
    const { layerName, options, chartsType, layerId, data } = themeProps;
    this.layerName = layerName || layerId;
    this.chartsType = chartsType || 'Bar';
    options.id = options.id || layerId;
    this.options = options;
    this.layerId = layerId;
    this.data = data || {};
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this._init();
  }

  setLayerName(layerName) {
    this.layerName = layerName;
    this.refresh();
  }

  setChartsType(chartsType) {
    this.chartsType = chartsType;
    this.refresh();
  }

  setData(data) {
    this.data = data;
    this.refresh();
  }

  setOptions(options) {
    this.options = options;
    this.refresh();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.GraphThemeLayer(this.layerName, this.chartsType, this.options);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.data);
  }

  refresh() {
    this.removed();
    this._init();
    this.fire('layerchange');
  }

  removed() {
    const { map, options } = this;
    const layerId = options.id;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
