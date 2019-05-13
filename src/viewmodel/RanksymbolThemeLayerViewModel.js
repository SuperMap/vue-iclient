import WidgetViewModel from './WidgetViewModel';

export default class RanksymbolThemeLayerViewModel extends WidgetViewModel {
  constructor(map, themeProps) {
    super(map);
    const { layerName, themeLayerOptions, symbolType, layerId, layerFeatures } = themeProps;
    this.map = map;
    this.layerName = layerName || layerId;
    this.symbolType = symbolType || 'Circle';
    this.themeLayerOptions = themeLayerOptions;
    this.layerId = layerId;
    this.layerFeatures = layerFeatures || [];
    this._init();
  }

  _init() {
    this.themeLayer = new mapboxgl.supermap.RankSymbolThemeLayer(this.layerName, this.symbolType, this.themeLayerOptions);
    this.map.addLayer(this.themeLayer);
    this.themeLayer.addFeatures(this.layerFeatures);
  }
}
