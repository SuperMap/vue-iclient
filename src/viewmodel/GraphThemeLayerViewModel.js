import WidgetViewModel from './WidgetViewModel';
import mapboxgl from '../../static/libs/mapboxgl/mapbox-gl-enhance'
import '../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min'

export default class GraphThemeLayerViewModel extends WidgetViewModel {
  constructor(map, themeProps) {
    super(map);
    const { layerName, themeLayerOptions, chartsType, layerId, layerFeatures } = themeProps;
    this.map = map;
    this.layerName = layerName || layerId;
    this.chartsType = chartsType || 'Bar';
    this.themeLayerOptions = themeLayerOptions;
    this.layerId = layerId;
    this.layerFeatures = layerFeatures || {};
    this._init();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.GraphThemeLayer(this.layerName, this.chartsType, this.themeLayerOptions);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.layerFeatures);
  }
}
