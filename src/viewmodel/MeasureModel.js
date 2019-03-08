import WidgetViewModel from './WidgetViewModel';

/**
 * @class MeasureViewModel
 * @description measure viewModel.
 * @param {Object} map - map对象。
 * @extends WidgetViewModel
 */
export default class MeasureViewModel extends WidgetViewModel {
  constructor(map) {
    super();
    this.map = map;
  }
}
