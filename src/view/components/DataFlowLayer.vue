<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import DataFlowLayerViewModel from '../../viewmodel/DataFlowLayerViewModel';
import widgets from '../../index.js';

/**
 * @module DataFlowLayer
 * @category Components Layer
 * @desc 数据流图层微件。
 * @vue-prop {String} serviceUrl - 数据流服务地址。
 * @vue-prop {String} [layerId] - 图层 ID。
 * @vue-prop {GeoJSONObject} [geometry] - 指定几何范围，该范围内的要素才能被订阅。
 * @vue-prop {String} [excludeField] - 排除字段。
 * @vue-prop {Object} [layerStyle] - 图层样式配置。
 * @vue-prop {widgets.commontypes.LineStyle} [layerStyle.line] - 线图层样式配置。
 * @vue-prop {widgets.commontypes.CircleStyle} [layerStyle.circle] - 点图层样式配置。
 * @vue-prop {widgets.commontypes.FillStyle} [layerStyle.fill] - 面图层样式配置。
 */

export default {
  name: 'SmDataFlowLayer',
  mixins: [MapGetter, Layer],
  props: {
    serviceUrl: {
      type: String,
      required: true
    },
    registerToken: {
      type: String
    },
    geometry: {
      type: Object
    },
    excludeField: {
      type: Object
    },
    layerStyle: {
      type: Object,
      default() {
        return {
          line: new widgets.commontypes.LineStyle(),
          circle: new widgets.commontypes.CircleStyle(),
          fill: new widgets.commontypes.FillStyle()
        };
      }
    }
  },
  loaded() {
    let options = JSON.parse(JSON.stringify(this.$props));
    delete options.serviceUrl;
    this.dataFlowLayerViewModel = new DataFlowLayerViewModel(this.map, this.serviceUrl, { ...options });
    this.registerEvents();
  },
  methods: {
    registerEvents() {
      this.dataFlowLayerViewModel.on('subscribefailed', e => {
        this.$message({
          showClose: true,
          message: '数据订阅失败！',
          type: 'error',
          duration: 1000
        });
        /**
         * @event subscribeFailed
         * @desc 数据订阅失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('subscribe-failed', e);
      });
      this.dataFlowLayerViewModel.on('subscribesucceeded', e => {
        /**
         * @event subscribeSucceeded
         * @desc 数据订阅失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('subscribe-succeeded', e);
      });
      this.dataFlowLayerViewModel.on('dataupdated', e => {
        /**
         * @event dataUpdated
         * @desc 数据更新成功后触发。
         * @property {GeoJSONObject} data - 更新的数据。
         * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
         */
        this.$emit('data-updated', e);
      });
    }
  },
  render() {}
};
</script>
