import WidgetModel from './WidgetModel';
/**
 * @class LayerModel
 * @description 图层数据模型。
 * @param {Object} options - 图层参数。
 * @param {String} [options.id] - 图层 ID。
 * @param {Number} [options.maxzoom] - 最大缩放级别。
 * @param {Number} [options.minzoom] - 最小缩放级别。
 * @param {GeoJSONObject} [options.source] - 数据源。
 * @param {String} [options.type] - 图层类型。
 * @param {String} [options.visibility] - 图层是否可见。
 * @category Model
 * @extends {WidgetModel}
 */
class LayerModel extends WidgetModel {
  constructor(options = {}) {
    super();
    this.id = options.id;
    this.maxzoom = options.maxzoom;
    this.minzoom = options.minzoom;
    this.source = options.source;
    this.type = options.type;
    this.visibility = options.visibility;
  }
}
export default LayerModel;
