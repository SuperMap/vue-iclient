import WidgetViewModel from './WidgetViewModel';

export default class ThemeLayerViewModel extends WidgetViewModel {
  constructor(map, themeProps) {
    super(map);
    const { dataUrl, themeParameters, tileUrl, layerId } = themeProps;
    this.dataUrl = dataUrl;
    this.themeParameters = themeParameters;
    this.tileUrl = tileUrl;
    this.layerId = layerId;
    this._init();
  }

  _init() {
    new mapboxgl.supermap.ThemeService(this.dataUrl).getThemeInfo(this.themeParameters, (serviceResult) => {
      var result = serviceResult.result;
      if (result && result.newResourceID) {
        const sourceName = this.layerId || 'theme';
        this.map.addSource(sourceName, {
          type: 'raster',
          tiles: [this.tileUrl + result.newResourceID],
          tileSize: 256
        });
        this.map.addLayer({
          id: this.layerId || 'themeLayer',
          type: 'raster',
          source: sourceName
        });
      }
    });
  }
}
