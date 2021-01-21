import mapboxgl from '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from '../../mapboxgl/web-map/SourceListModel';

interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}

/**
 * @class LayerListViewModel
 * @description LayerList viewModel.
 * @param {Object} map - map实例对象。
 * @extends mapboxgl.Evented
 */
class LayerListViewModel extends mapboxgl.Evented {
  sourceList:Array<any>;

  map: mapboxglTypes.Map;

  fire: any;

  updateFn:MapEventCallBack;

  constructor() {
    super();
    this.sourceList = [];
    this.updateFn = this._updateLayers.bind(this);
  }

  _updateLayers(data) {
    this.initTreeData();
    this.fire('layersupdated', { sourceList: this.sourceList });
  }
  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this.map.on('styledata', this.updateFn);
    this.initTreeData();
  }

  initTreeData() {
    const sourceListModel = new SourceListModel({
      map: this.map
    });
    // @ts-ignore
    this.sourceList = sourceListModel.getSourceList();
  }

  removed() {
    this.sourceList = [];
    this.map.off('styledata', this.updateFn);
  }
}
export default LayerListViewModel;
