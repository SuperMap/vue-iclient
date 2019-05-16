<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import HeatmapLayerViewModel from '../../viewmodel/HeatmapLayerViewModel';
export default {
  name: 'SmHeatmapLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      required: true
    },
    paint: {
      type: Object
    }
  },
  loaded() {
    this.viewModel = new HeatmapLayerViewModel(this.map, this.data, this.paint, { layerId: this.layerId });
  },
  render() {}
};
</script>
