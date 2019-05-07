import WidgetViewModel from "./WidgetViewModel";

export default class MapVViewModel extends WidgetViewModel {
  constructor(map, mapVProps) {
    super(map);
    const { dataSet, mapvOptions } = mapVProps;
    this.dataSet = dataSet;
    this.mapvOptions = mapvOptions;
    this._init();
  }

  _init() {
    if (this.dataSet && this.mapvOptions) {
      this._addMapVLayer();
    }
  }

  _addMapVLayer() {
    const mapVLayer = new mapboxgl.supermap.MapvLayer("", this.dataSet, this.mapvOptions);
    this.map.addLayer(mapVLayer);
  }
}
