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
  loaded() {
    this.viewModel = new RangeThemeLayerViewModel(this.map, this.$props);
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
