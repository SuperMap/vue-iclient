import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from '../../SourceListModel';

/**
 * @class LayerListViewModel
 * @description LayerList viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层更新
 * @extends mapboxgl.Evented
 */
class LayerListViewModel extends mapboxgl.Evented {
  constructor(map) {
    super();
    this.map = map;
    this.sourceList = {};
    this.sourceNames = [];
    this._init();
  }
  _init() {
    this.map.on('styledata', this._updateLayers.bind(this));
  }
  _updateLayers(data) {
    this.fire('layersUpdated');
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
  changeLayerVisible(sourcelayer, sourceName, visibility) {
    this.sourceListModel.getLayersBySourceLayer(sourceName, sourcelayer).forEach(layer => {
      this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
    });
  }

  changeVisibility(visibility) {
    return visibility === 'visible' ? 'none' : 'visible';
  }

  changeLayerGroupVisibility(sourceName, visibility) {
    let sourceLayers = this.sourceListModel.getSourceLayersBySource(sourceName);
    if (sourceLayers) {
      for (let sourcelayer in sourceLayers) {
        sourceLayers[sourcelayer].forEach(layer => {
          this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
        });
      }
    } else {
      for (let layer of this.sourceList[sourceName]['layers']) {
        this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
      }
    }
  }
}
export default LayerListViewModel;
