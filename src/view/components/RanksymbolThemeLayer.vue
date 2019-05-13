<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import RanksymbolThemeLayerViewModel from '../../viewmodel/RanksymbolThemeLayerViewModel.js';

export default {
  name: 'SmRanksymbolThemeLayer',
  mixins: [MapGetter, Layer],
  props: {
    symbolType: {
      type: String,
      required: true
    },
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
    this.viewModel = new RanksymbolThemeLayerViewModel(this.map, this.$props);
    this.addLayerSucceededCallback && this.addLayerSucceededCallback(this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
