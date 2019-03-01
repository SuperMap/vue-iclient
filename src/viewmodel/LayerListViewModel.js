import LayerModel from '../model/LayerModel';
import WidgetViewModel from './WidgetViewModel';
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
        this.cacheLayers = [];
        this._init();
    }
    _init(){
        this.map.on('styledata',this._updateLayers.bind(this))
    }
    _updateLayers(){
        this.fire('layersUpdated')
    }
    getLayers() {
        this.cacheLayers = [];
        Object.keys(this.map.style._layers).forEach((layerKey, index) => {
            this.cacheLayers[index] = new LayerModel(this.map.style._layers[layerKey]);
        });
        return this.cacheLayers;
    }
    setVisibleStatus(source, visibility) {
        this.map.setLayoutProperty(source, 'visibility', visibility);
        return this.getLayers();
    }
}
export default LayerListViewModel;