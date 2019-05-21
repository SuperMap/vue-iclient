<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import RangeThemeLayerViewModel from '../../viewmodel/RangeThemeLayerViewModel.js';

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
