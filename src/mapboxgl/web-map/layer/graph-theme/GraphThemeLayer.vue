<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import GraphThemeLayerViewModel from './GraphThemeLayerViewModel.js';

export default {
  name: 'SmGraphThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    chartsType: {
      type: String,
      required: true
    },
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
      type: Object,
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
    chartsType(val) {
      this.viewModel && this.viewModel.setChartsType(val);
    },
    layerName(val) {
      this.viewModel && this.viewModel.setLayerName(val);
    }
  },
  created() {
    this.viewModel = new GraphThemeLayerViewModel(this.$props);
  },
  loaded() {
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
