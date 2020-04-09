<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import DataFlowLayerViewModel from './DataFlowLayerViewModel';
import CircleStyle from '../../../_types/CircleStyle';
import FillStyle from '../../../_types/FillStyle';
import LineStyle from '../../../_types/LineStyle';

/**
 * @module DataFlowLayer
 * @category Components Layer
 * @desc 数据流图层组件。
 * @vue-prop {String} serviceUrl - 数据流服务地址。
 * @vue-prop {String} [registerToken] -  SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。
 * @vue-prop {GeoJSONObject} [geometry] - 指定几何范围，该范围内的要素才能被订阅。
 * @vue-prop {String} [excludeField] - 排除字段。
 * @vue-prop {Object} [layerStyle] - 图层样式配置。
 * @vue-prop {SuperMap.Components.commontypes.LineStyle} [layerStyle.line] - 线图层样式配置。
 * @vue-prop {SuperMap.Components.commontypes.CircleStyle} [layerStyle.circle] - 点图层样式配置。
 * @vue-prop {SuperMap.Components.commontypes.FillStyle} [layerStyle.fill] - 面图层样式配置。
 */

export default {
  name: 'SmDataFlowLayer',
  mixins: [MapGetter, Layer],
  viewModelProps: ['layerStyle'],
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
          line: new LineStyle(),
          circle: new CircleStyle(),
          fill: new FillStyle()
        };
      }
    }
  },
  loaded() {},
  created() {
    let options = JSON.parse(JSON.stringify(this.$props));
    delete options.serviceUrl;
    this.viewModel = new DataFlowLayerViewModel(this.serviceUrl, { ...options });
    this.registerEvents();
  },
  beforeDestroy() {
    this.viewModel.off('subscribefailed', this.subscribefailedFn);
    this.viewModel.off('subscribesucceeded', this.subscribesucceededFn);
    this.viewModel.off('dataupdated', this.dataupdatedFn);
  },
  methods: {
    registerEvents() {
      this.viewModel.on('subscribefailed', this.subscribefailedFn);
      this.viewModel.on('subscribesucceeded', this.subscribesucceededFn);
      this.viewModel.on('dataupdated', this.dataupdatedFn);
    },
    subscribefailedFn(e) {
      this.$message.error(this.$t('dataFlow.dataSubscriptionFailed'));
      /**
       * @event subscribeFailed
       * @desc 数据订阅失败后触发。
       * @property {Object} e  - 事件对象。
       */
      this.$emit('subscribe-failed', e);
    },
    subscribesucceededFn(e) {
      /**
       * @event subscribeSucceeded
       * @desc 数据订阅失败后触发。
       * @property {Object} e  - 事件对象。
       */
      this.$emit('subscribe-succeeded', e);
    },
    dataupdatedFn(e) {
      /**
       * @event dataUpdated
       * @desc 数据更新成功后触发。
       * @property {GeoJSONObject} data - 更新的数据。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.$emit('data-updated', e);
    }
  },
  render() {}
};
</script>
