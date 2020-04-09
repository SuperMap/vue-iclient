<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
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
