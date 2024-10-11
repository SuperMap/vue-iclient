import HighlightLayer from 'vue-iclient/src/mapboxgl/_utils/HightlighLayer';

/**
 * @class IdentifyViewModel
 * @description 点选 viewModel.
 * @param {Object} map - map 对象。
 * @param {Object} [options.layerStyle] - 查询结果图层样式配置。
 * @param {Object} [options.layerStyle.line] - 线图层样式配置。
 * @param {Object} [options.layerStyle.circle] - 点图层样式配置。
 * @param {Object} [options.layerStyle.fill] - 面图层样式配置。
 * @param {Object} [options.layerStyle.stokeLine] - 面图层样式配置。
 * @extends mapboxgl.Evented
 */
export default class IdentifyViewModel extends HighlightLayer {
  constructor(map, options) {
    super({ name: 'identify', layerIds: options.layers, style: options.layerStyle });
    this.map = map;
  }

  /**
   * @function IdentifyViewModel.prototype.addOverlayToMap
   * @desc 添加高亮图层。
   * @param {Object} layer - layer。
   */
  addOverlayToMap(layer, filter) {
    this.addHighlightLayers(layer, filter);
  }

  /**
   * @function IdentifyViewModel.prototype.removed
   * @desc 清除高亮图层。
   */
  removed(layers) {
    // 移除高亮图层
    this.removeOverlayer(layers);
  }

  removeOverlayer(layers) {
    this.removeHighlightLayers(layers);
  }
}
