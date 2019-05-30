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
      type: Array,
      required: true
    }
  },
  loaded() {
    this.viewModel = new RanksymbolThemeLayerViewModel(this.map, this.$props);
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
