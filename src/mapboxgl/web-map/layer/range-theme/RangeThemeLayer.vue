<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import RangeThemeLayerViewModel from './RangeThemeLayerViewModel.js';

export default {
  name: 'SmRangeThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerName: {
      type: String
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    },
    data: {
      type: Array,
      required: true
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
    },
    layerName(val) {
      this.viewModel && this.viewModel.setLayerName(val);
    }
  },
  created() {
    this.viewModel = new RangeThemeLayerViewModel(this.$props);
  },
  loaded() {
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
