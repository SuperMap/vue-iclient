import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import WebMapViewModel from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class LayerSelectViewModel
 * @description LayerSelect viewModel.
 * @param {Object} map - map实例对象。
 * @extends mapboxgl.Evented
 */
class LayerSelectViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  webmap: InstanceType<typeof WebMapViewModel>;
  fire: any;
  updateFn: (data?: mapboxglTypes.MapStyleDataEvent) => void;

  constructor() {
    super();
    this.updateFn = this._updateLayers.bind(this);
  }

  _updateLayers() {
    const sourceList = this.webmap.getLayerList();
    this.fire('layersupdated', { sourceList });
  }

  setMap(mapInfo: mapInfoType) {
    const { map, webmap } = mapInfo;
    this.map = map;
    this.webmap = webmap;
    this.map.on('styledata', this.updateFn);
    this._updateLayers();
  }

  removed() {
    this.map.off('styledata', this.updateFn);
  }
}
export default LayerSelectViewModel;
