<script>
import MapGetter from '../mixin/map-getter';
import ClusterLayerViewModel from '../../viewmodel/ClusterLayerViewModel';
import Layer from '../mixin/layer';
import widgets from '../../index.js';

export default {
  name: 'SmClusterLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      required: true
    },
    radius: {
      type: Number,
      default: 50
    },
    maxZoom: {
      type: Number,
      default: 14
    },
    clusteredPointStyle: {
      type: Object,
      default() {
        return new widgets.commontypes.CircleStyle({
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        });
      }
    },
    unclusteredPointStyle: {
      type: Object,
      default() {
        return new widgets.commontypes.CircleStyle({
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        });
      }
    },
    clusteredPointTextLayout: {
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
