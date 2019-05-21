<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import DeckglLayerViewModel from '../../viewmodel/DeckglLayerViewModel';

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
        const matchIndex = LAYER_TYPE_ID_LIST.findIndex(
          item => item === layerType
        );
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
  loaded() {
    const matchIndex = LAYER_TYPE_ID_LIST.findIndex(
      item => item === this.layerType
    );
    if (matchIndex > -1) {
      this.viewModel = new DeckglLayerViewModel(this.map, this.$props);
    }
  },
  render() {}
};
</script>
