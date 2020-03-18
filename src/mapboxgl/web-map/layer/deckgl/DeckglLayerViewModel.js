import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import '../../../../../static/libs/deckgl/deck.gl.min';

export default class DeckglLayerViewModel extends mapboxgl.Evented {
  constructor(deckglProps) {
    super();
    const { layerType, options, layerId } = deckglProps;
    this.layerType = layerType;
    options.data = options.data || [];
    options.layerId = options.layerId || layerId;
    this.options = options;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this._init();
  }

  setLayerType(layerType) {
    this.layerType = layerType;
    this.removed();
    this._init();
  }

  setOptions(options) {
    this.options = options;
    this.removed();
    this._init();
  }

  _init() {
    if (this.layerType && this.options) {
      this._addDeckglLayer();
    }
  }

  _addDeckglLayer() {
    const deckglLayer = new mapboxgl.supermap.DeckglLayer(this.layerType, this.options);
    this.map.addLayer(deckglLayer);
  }

  removed() {
    const { map, options: { layerId } } = this;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
