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
  loaded() {
    this.viewModel = new UniqueThemeLayerViewModel(this.map, this.$props);
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
