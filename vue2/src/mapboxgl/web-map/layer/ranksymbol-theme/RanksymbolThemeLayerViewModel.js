import mapboxgl from 'vue-iclient-core/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient-core/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class RanksymbolThemeLayerViewModel extends mapboxgl.Evented {
  constructor(themeProps) {
    super();
    const { layerName, options, symbolType, layerId, data } = themeProps;
    this.layerName = layerName || layerId;
    this.symbolType = symbolType || 'Circle';
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

  setLayerName(layerName) {
    this.layerName = layerName;
    this.refresh();
  }

  setSymbolType(symbolType) {
    this.symbolType = symbolType;
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
    this.themeLayer = new mapboxgl.supermap.RankSymbolThemeLayer(this.layerName, this.symbolType, this.options);
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
