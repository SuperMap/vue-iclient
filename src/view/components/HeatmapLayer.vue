<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import HeatmapLayerViewModel from '../../viewmodel/HeatmapLayerViewModel';
import widgets from '../../index.js';
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
        return new widgets.commontypes.HeatMapStyle();
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
