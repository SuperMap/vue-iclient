import WidgetViewModel from '../../../_types/WidgetViewModel';

/**
 * @class PanViewModel
 * @description pan viewModel（平移控件vm层）.
 * @param {Object} map - 地图对象。
 * @extends WidgetViewModel
 */

export default class PanViewModel extends WidgetViewModel {
  constructor(map) {
    super();
    this.map = map || null;
  }
  /**
   * @function PanViewModel.prototype.panTo
   * @description 地图平移至目标位置。
   * @param {Object} lnglat - 目标位置：坐标经纬度
   */
  panTo(lnglat) {
    this.map.panTo(lnglat);
  }
  /**
   * @function PanViewModel.prototype.panBy
   * @description 地图平移至目标位置。
   * @param {Array} point - 目标位置（px）
   */
  panBy(point) {
    // Represents a point with `x` and `y` coordinates in pixels. [200, 300]
    this.map.panBy(point);
  }
}
