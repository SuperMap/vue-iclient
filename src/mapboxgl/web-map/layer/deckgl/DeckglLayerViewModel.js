import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';
import '../../../../../static/libs/deckgl/deck.gl.min';

export default class DeckglLayerViewModel extends mapboxgl.Evented {
  constructor(map, deckglProps) {
    super();
    this.map = map;
    const { layerType, options, layerId } = deckglProps;
    this.layerType = layerType;
    options.data = options.data || [];
    options.layerId = options.layerId || layerId;
    this.options = options;
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
}
