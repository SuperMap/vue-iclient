import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from 'vue-iclient/src/mapboxgl/web-map/SourceListModel';

/**
 * @class LayerListViewModel
 * @description LayerList viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层更新
 * @extends mapboxgl.Evented
 */
interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}
class LayerListViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  sourceList: Object;

  sourceNames: Array<string>;

  fire: any;

  updateFn: MapEventCallBack;

  sourceListModel: SourceListModel;

  constructor() {
    super();
    this.sourceList = {};
    this.sourceNames = [];
  }

  _updateLayers() {
    this.fire('layersUpdated');
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this.updateFn = this._updateLayers.bind(this);
    this.map.on('styledata', this.updateFn);
  }

  initLayerList() {
    this.sourceListModel = new SourceListModel({
      map: this.map
    });
    this.sourceList = this.sourceListModel.getSourceList();
    this.sourceNames = this.sourceListModel.getSourceNames().reverse();
    return this.sourceList;
  }

  getSourceNames() {
    return this.sourceNames;
  }

  changeLayerVisible(sourcelayer, sourceName: string, visibility: string) {
    this.sourceListModel.getLayersBySourceLayer(sourceName, sourcelayer).forEach(layer => {
      this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
    });
  }

  changeVisibility(visibility: string) {
    return visibility === 'visible' ? 'none' : 'visible';
  }

  changeLayerGroupVisibility(sourceName: string, visibility: string) {
    let sourceLayers = this.sourceListModel.getSourceLayersBySource(sourceName);
    if (sourceLayers) {
      for (let sourcelayer in sourceLayers) {
        sourceLayers[sourcelayer].forEach(layer => {
          this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
        });
      }
    } else {
      for (let layer of this.sourceList[sourceName].layers) {
        this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
      }
    }
  }

  removed() {
    this.sourceList = {};
    this.sourceNames = [];
    this.map.off('styledata', this.updateFn);
  }
}
export default LayerListViewModel;
