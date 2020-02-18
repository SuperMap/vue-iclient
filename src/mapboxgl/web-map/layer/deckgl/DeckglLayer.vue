<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import DeckglLayerViewModel from './DeckglLayerViewModel';

const LAYER_TYPE_ID_LIST = [
  'scatter-plot',
  'path-layer',
  'polygon-layer',
  'arc-layer',
  'hexagon-layer',
  'screen-grid-layer'
];

export default {
  name: 'SmDeckglLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerType: {
      type: String,
      required: true,
      validator(layerType) {
        const matchIndex = LAYER_TYPE_ID_LIST.findIndex(item => item === layerType);
        return matchIndex > -1;
      }
    },
    options: {
      type: Object,
      default() {
        return { data: [] };
      }
    }
  },
  watch: {
    options: {
      handler(val) {
        this.viewModel && this.viewModel.setOptions(val);
      },
      deep: true
    },
    layerType(val) {
      this.viewModel && this.viewModel.setLayerType(val);
    }
  },
  created() {
    const matchIndex = LAYER_TYPE_ID_LIST.findIndex(item => item === this.layerType);
    if (matchIndex > -1) {
      this.viewModel = new DeckglLayerViewModel(this.$props);
    }
  },
  render() {}
};
</script>
