<script>
import MapGetter from "../mixin/map-getter";
import Layer from "../mixin/layer";
import DataFlowLayerViewModel from "../../viewmodel/DataFlowLayerViewModel";

/**
 * @module DataFlowLayer
 * @category Components DataFlowLayer
 * @desc 数据流图层微件。
 * @vue-prop {mapboxgl.Map} map - Mapboxgl Map 对象。
 * @vue-prop {String} dataFlowUrl - 数据流服务地址。
 * @vue-prop {Object} [options] - 可选参数。
 * @vue-prop {String} [options.layerId] - 图层 ID。
 * @vue-prop {GeoJSONObject} [options.geometry] - 指定几何范围，该范围内的要素才能被订阅。
 * @vue-prop {Object} [options.excludeField] - 排除字段。
 * @vue-prop {Object} [options.styleOptions] - style OPtion。
 */

export default {
  name: "SmDataFlowLayer",
  mixins: [MapGetter, Layer],
  props: {
    dataFlowUrl: {
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
    }
  },
  loaded() {
    const { layerId, geometry, excludeField, registerToken } = this.$props;
    this.dataFlowLayerViewModel = new DataFlowLayerViewModel(
      this.map,
      this.dataFlowUrl,
      { layerId, geometry, excludeField, registerToken }
    );
    this.registerEvents();
  },
  methods: {
    registerEvents() {
      /**
       * @typedef {Object} DataFlowLayer.options - 可选参数。
       * @property {string} [layerId] - 服务类型 iServer, iPortal。
       * @property {string} [geometry - 服务url地址。
       * @property {boolean} [withCredentials = false] - 设置请求是否带cookie
       * @property {SuperMap.FilterParameter} queryInfo - 查询条件
       */
      this.dataFlowLayerViewModel.on("subscribefailed", e => {
        this.$message({
          showClose: true,
          message: "数据订阅失败！",
          type: "error",
          duration: 1000
        });
        /**
         * @event subscribeFailed
         * @desc 数据订阅失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit("subscribe-failed", e);
      });
      this.dataFlowLayerViewModel.on("subscribesucceeded", e => {
        /**
         * @event subscribeSucceeded
         * @desc 数据订阅失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit("subscribe-succeeded", e);
      });
      this.dataFlowLayerViewModel.on("dataupdated", e => {
        /**
         * @event dataUpdated
         * @desc 数据更新成功后触发。
         * @property {GeoJSONObject} data - 更新的数据。
         * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
         */
        this.$emit("data-updated", e);
      });
    }
  },
  render() {}
};
</script>