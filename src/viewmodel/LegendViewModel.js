import WidgetViewModel from './WidgetViewModel';

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends WidgetViewModel
 */
class LegendViewModel extends WidgetViewModel {
  constructor(webmap) {
    super(webmap);
    this.webmap = webmap;
    this.sourceListModel = this.webmap.getSourceListModel();
  }

  getStyle(layerName) {
    return this.sourceListModel.getLegendStyle(layerName);
  }
}
export default LegendViewModel;
