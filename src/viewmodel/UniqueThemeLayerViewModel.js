import WidgetViewModel from './WidgetViewModel';

export default class UniqueThemeLayerViewModel extends WidgetViewModel {
  constructor(map, themeProps) {
    super(map);
    const { layerName, themeLayerOptions, layerId, layerFeatures } = themeProps;
    this.map = map;
    this.layerName = layerName || layerId;
    this.themeLayerOptions = themeLayerOptions;
    this.layerId = layerId;
    this.layerFeatures = layerFeatures || [];
    this._init();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.UniqueThemeLayer(this.layerName, this.themeLayerOptions);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.layerFeatures);
  }
}
