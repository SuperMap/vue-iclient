<script>
import MapGetter from '../../../_mixin/map-getter';
import ClusterLayerViewModel from './ClusterLayerViewModel';
import Layer from '../../../_mixin/layer';
import CircleStyle from '../../../_types/CircleStyle';

export default {
  name: 'SmClusterLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      required: true
    },
    maxzoom: {
      type: Number,
      default: 14
    },
    radius: {
      type: Number,
      default: 50
    },
    clusteredPointStyle: {
      type: Object,
      default() {
        return new CircleStyle({
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        });
      }
    },
    unclusteredPointStyle: {
      type: Object,
      default() {
        return new CircleStyle({
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
  watch: {
    data(newVal, oldVal) {
      if (this.viewModel) {
        this.viewModel.setData(this.data);
      }
    },
    clusteredPointStyle() {
      this.viewModel && this.viewModel.setClusteredPointStyle(this.clusteredPointStyle);
    },
    unclusteredPointStyle() {
      this.viewModel && this.viewModel.setUnclusteredPointStyle(this.unclusteredPointStyle);
    },
    clusteredPointTextLayout() {
      this.viewModel && this.viewModel.setClusteredPointTextLayout(this.clusteredPointTextLayout);
    }
  },
  created() {
    let options = JSON.parse(JSON.stringify(this.$props));
    delete options.data;
    this.viewModel = new ClusterLayerViewModel(this.data, { ...options });
  },
  render() {}
};
</script>
