<script>
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import HeatmapLayerViewModel from './HeatmapLayerViewModel';
import HeatMapStyle from 'vue-iclient/src/mapboxgl/_types/HeatMapStyle';

export default {
  name: 'SmHeatmapLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      required: true
    },
    layerStyle: {
      type: Object,
      default() {
        return new HeatMapStyle();
      }
    }
  },
  watch: {
    data: {
      handler(val) {
        this.viewModel && this.viewModel.setData(val);
      },
      deep: true
    },
    layerStyle: {
      handler(val) {
        this.viewModel && this.viewModel.setLayerStyle(val);
      },
      deep: true
    }
  },
  created() {
    this.viewModel = new HeatmapLayerViewModel(this.data, {
      layerId: this.layerId,
      layerStyle: this.layerStyle
    });
  },
  render() {}
};
</script>
