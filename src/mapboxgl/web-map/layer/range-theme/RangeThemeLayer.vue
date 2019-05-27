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
    addLayerSucceededCallback: {
      type: Function
    },
    data: {
      type: Array,
      required: true
    }
  },
  loaded() {
    this.viewModel = new RangeThemeLayerViewModel(this.map, this.$props);
    this.addLayerSucceededCallback && this.addLayerSucceededCallback(this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
