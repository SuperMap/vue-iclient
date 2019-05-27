<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import HeatmapLayerViewModel from './HeatmapLayerViewModel';
import HeatMapStyle from './HeatMapStyle';

export default {
  name: 'SmHeatmapLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      required: true
    },
    layerStyle: {
      type: Object,
      default() {
        return new HeatMapStyle();
      }
    }
  },
  loaded() {
    this.viewModel = new HeatmapLayerViewModel(this.map, this.data, {
      layerId: this.layerId,
      layerStyle: this.layerStyle
    });
  },
  render() {}
};
</script>
