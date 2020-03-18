<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import UniqueThemeLayerViewModel from './UniqueThemeLayerViewModel.js';

export default {
  name: 'SmUniqueThemeLayer',
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
    options: {
      handler(val) {
        this.viewModel && this.viewModel.setOptions(val);
      },
      deep: true
    },
    data: {
      handler(val) {
        this.viewModel && this.viewModel.setData(val);
      },
      deep: true
    }
  },
  created() {
    this.viewModel = new UniqueThemeLayerViewModel(this.$props);
  },
  loaded() {
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
