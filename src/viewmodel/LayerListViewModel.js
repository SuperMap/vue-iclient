import WidgetViewModel from './WidgetViewModel';
import SourceListModel from '../model/SourceListModel'

/**
 * @class LayerListViewModel
 * @description LayerList viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层更新
 * @extends WidgetViewModel
 */
class LayerListViewModel extends WidgetViewModel {
    constructor(map) {
        super(map);
        this.sourceList = {}
        this._init();
    }
    _init() {
        this.map.on('styledata', this._updateLayers.bind(this))
    }
    _updateLayers(data) {
        this.fire('layersUpdated')
    }
    initLayerList() {
        this.sourceListModel = new SourceListModel({
            map: this.map,
        });
        this.sourceList = this.sourceListModel.getSourceList();

        return this.sourceList;
    }
    changeLayerVisible(sourcelayer, sourceName, visibility) {
        this.sourceListModel.getLayersBySourceLayer(sourceName, sourcelayer).forEach(layer => {
            this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
        })
    }

    changeVisibility(visibility) {
        return visibility === "visible" ? "none" : "visible";
    }
    
    changeLayerGroupVisibility(sourceName, visibility) {
        let sourceLayers = this.sourceListModel.getSourceLayersBySource(sourceName)
        if (sourceLayers) {
            for (let sourcelayer in sourceLayers) {
                sourceLayers[sourcelayer].forEach(layer => {
                    this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
                })
            }
        } else {
            for(let layer of this.sourceList[sourceName]['layers']){
                this.map.setLayoutProperty(layer.id, 'visibility', this.changeVisibility(visibility));
            }
        }
    }
}
export default LayerListViewModel;