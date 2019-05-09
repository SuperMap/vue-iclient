<script>
import MapGetter from "../mixin/map-getter";
import Layer from "../mixin/layer";
import DataFlowLayerViewModel from "../../viewmodel/DataFlowLayerViewModel";
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
    this.dataFlowLayerViewModel = new DataFlowLayerViewModel( this.map, this.dataFlowUrl, { layerId, geometry, excludeField, registerToken } );
    this.registerEvents();
  },
  methods: {
    registerEvents() {
      this.dataFlowLayerViewModel.on("subscribefailed", e => {
        this.$message({
          showClose: true,
          message: "数据订阅失败！",
          type: "error",
          duration: 1000
        });
        console.log(e);
      });
    }
  },
  render() {}
};
</script>