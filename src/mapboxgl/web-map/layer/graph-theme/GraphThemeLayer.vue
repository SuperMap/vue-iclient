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
  loaded() {
    this.viewModel = new GraphThemeLayerViewModel(this.map, this.$props);
    this.$emit('load', this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
