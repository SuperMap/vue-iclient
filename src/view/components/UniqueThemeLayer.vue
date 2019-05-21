<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import UniqueThemeLayerViewModel from '../../viewmodel/UniqueThemeLayerViewModel.js';

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
