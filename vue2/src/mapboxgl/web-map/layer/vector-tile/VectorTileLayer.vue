<script>
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import VectorTileLayerViewModel from './VectorTileLayerViewModel';

export default {
  name: 'SmVectorTileLayer',
  mixins: [MapGetter, Layer],
  props: {
    styleOptions: {
      type: [String, Object]
    }
  },
  watch: {
    styleOptions: {
      handler(val) {
        this.viewModel && this.viewModel.setStyleOptions(val);
      },
      deep: true
    }
  },
  created() {
    this.viewModel = new VectorTileLayerViewModel(this.styleOptions, this.before);
  },
  render() {}
};
</script>
