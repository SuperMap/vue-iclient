import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';

export default class GraphThemeLayerViewModel extends mapboxgl.Evented {
  constructor(map, themeProps) {
    super();
    this.map = map;
    const { layerName, options, chartsType, layerId, data } = themeProps;
    this.layerName = layerName || layerId;
    this.chartsType = chartsType || 'Bar';
    options.id = options.id || layerId;
    this.options = options;
    this.layerId = layerId;
    this.data = data || {};
    this._init();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.GraphThemeLayer(this.layerName, this.chartsType, this.options);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.data);
  }
}
