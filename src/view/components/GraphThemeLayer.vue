<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import GraphThemeLayerViewModel from '../../viewmodel/GraphThemeLayerViewModel.js';

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
    addLayerSucceededCallback: {
      type: Function
    },
    data: {
      type: Object,
      required: true
    }
  },
  loaded() {
    this.viewModel = new GraphThemeLayerViewModel(this.map, this.$props);
    this.addLayerSucceededCallback && this.addLayerSucceededCallback(this.viewModel.themeLayer, this.map);
  },
  render() {}
};
</script>
