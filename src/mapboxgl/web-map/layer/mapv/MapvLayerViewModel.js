import WidgetViewModel from '../../../_types/WidgetViewModel';
import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient9-mapboxgl.min';

export default class MapvLayerViewModel extends WidgetViewModel {
  constructor(map, mapvLayerProps) {
    super(map);
    const { data, options, layerId } = mapvLayerProps;
    this.data = data;
    this.options = options.layerId ? options : { ...options, layerId };
    this._init();
  }

  _init() {
    if (this.data && this.options) {
      this._addMapvLayer();
    }
  }

  _addMapvLayer() {
    const mapVLayer = new mapboxgl.supermap.MapvLayer('', this.data, this.options);
    this.map.addLayer(mapVLayer);
  }
}
