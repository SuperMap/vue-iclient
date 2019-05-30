<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import LabelThemeLayerViewModel from './LabelThemeLayerViewModel.js';

export default {
  name: 'SmLabelThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerName: {
      type: String,
      required: true
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
    this.viewModel = new LabelThemeLayerViewModel(this.map, this.$props);
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
