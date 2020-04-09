<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import RanksymbolThemeLayerViewModel from './RanksymbolThemeLayerViewModel.js';

export default {
  name: 'SmRanksymbolThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    symbolType: {
      type: String,
      default: 'Circle'
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
    symbolType(val) {
      this.viewModel && this.viewModel.setSymbolType(val);
    },
    layerName(val) {
      this.viewModel && this.viewModel.setLayerName(val);
    }
  },
  created() {
    this.viewModel = new RanksymbolThemeLayerViewModel(this.$props);
  },
  loaded() {
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
