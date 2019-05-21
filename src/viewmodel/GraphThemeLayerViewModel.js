import WidgetViewModel from './WidgetViewModel';
import mapboxgl from '../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';

export default class GraphThemeLayerViewModel extends WidgetViewModel {
  constructor(map, themeProps) {
    super(map);
    const { layerName, options, chartsType, layerId, data } = themeProps;
    this.map = map;
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
