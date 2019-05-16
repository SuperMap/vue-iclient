<script>
import MapGetter from '../mixin/map-getter';
import ClusterLayerViewModel from '../../viewmodel/ClusterLayerViewModel';
import Layer from '../mixin/layer';
export default {
  name: 'SmClusterLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      required: true
    },
    clusterRadius: {
      type: Number,
      default: 50
    },
    clusterMaxZoom: {
      type: Number,
      default: 14
    },
    clusterPointPaint: {
      type: Object
    },
    clusterPointTextLayout: {
      type: Object
    },
    unclusteredPointPaint: {
      type: Object
    }
  },
  loaded() {
    let options = JSON.parse(JSON.stringify(this.$props));
    delete options.data;
    this.viewModel = new ClusterLayerViewModel(this.map, this.data, { ...options });
  },
  render() {}
};
</script>
