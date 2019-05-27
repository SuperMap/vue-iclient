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
    addLayerSucceededCallback: {
      type: Function
    },
    data: {
      type: Array,
      required: true
    }
  },
  loaded() {
    this.viewModel = new UniqueThemeLayerViewModel(this.map, this.$props);
    this.addLayerSucceededCallback && this.addLayerSucceededCallback(this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
