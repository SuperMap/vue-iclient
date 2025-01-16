import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';
import WebMapViewModel from '@libs/mapboxgl/mapbox-gl-enhance';

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
    this.webmap.on({
      layerupdatechanged: this.updateFn
    });
    this._updateLayers();
  }

  removed() {
    this.webmap.un({
      layerupdatechanged: this.updateFn
    });
  }
}
export default LayerSelectViewModel;
