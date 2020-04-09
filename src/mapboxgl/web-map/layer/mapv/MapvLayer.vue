<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import MapvLayerViewModel from './MapvLayerViewModel';

export default {
  name: 'SmMapvLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    options: {
      type: Object,
      default() {
        return {};
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
    options: {
      handler(val) {
        this.viewModel && this.viewModel.setOptions(val);
      },
      deep: true
    }
  },
  created() {
    this.viewModel = new MapvLayerViewModel(this.$props);
  },
  render() {}
};
</script>
