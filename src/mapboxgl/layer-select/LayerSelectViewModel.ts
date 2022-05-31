import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from 'vue-iclient/src/mapboxgl/web-map/SourceListModel';

/**
 * @class LayerSelectViewModel
 * @description LayerSelect viewModel.
 * @param {Object} map - map实例对象。
 * @extends mapboxgl.Evented
 */
class LayerSelectViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  fire: any;
  updateFn: (data?: mapboxglTypes.MapStyleDataEvent) => void;

  constructor() {
    super();
    this.updateFn = this._updateLayers.bind(this);
  }

  _updateLayers() {
    const sourceListModel = new SourceListModel({
      map: this.map
    });
    const sourceList = sourceListModel.getSourceList();
    this.fire('layersupdated', { sourceList });
  }

  setMap(mapInfo: mapInfoType) {
    const { map } = mapInfo;
    this.map = map;
    this.map.on('styledata', this.updateFn);
    this._updateLayers();
  }

  removed() {
    this.map.off('styledata', this.updateFn);
  }
}
export default LayerSelectViewModel;
