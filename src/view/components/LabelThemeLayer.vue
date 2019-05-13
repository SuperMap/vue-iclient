<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import LabelThemeLayerViewModel from '../../viewmodel/LabelThemeLayerViewModel.js';

export default {
  name: 'SmLabelThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerName: {
      type: String,
      required: true
    },
    themeLayerOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    addLayerSucceededCallback: {
      type: Function
    },
    layerFeatures: {
      type: Array,
      required: true
    }
  },
  loaded() {
    this.viewModel = new LabelThemeLayerViewModel(this.map, this.$props);
    this.addLayerSucceededCallback && this.addLayerSucceededCallback(this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
