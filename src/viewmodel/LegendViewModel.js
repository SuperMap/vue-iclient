import WidgetViewModel from './WidgetViewModel';

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends WidgetViewModel
 */
class LegendViewModel extends WidgetViewModel {
    constructor(webmap) {
        super(map);
        this.webmap = webmap;
        this.sourceListModel = this.webmap.getSourceListModel()
    }
    
    getStyle(layerName){
        if(!this.sourceListModel.sourceList[layerName]){
            return false;
        }
        return this.sourceListModel.sourceList[layerName].style
    }

    
}
export default LegendViewModel;