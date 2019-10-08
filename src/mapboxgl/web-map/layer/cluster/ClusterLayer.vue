<script>
import MapGetter from '../../../_mixin/map-getter';
import ClusterLayerViewModel from './ClusterLayerViewModel';
import Layer from '../../../_mixin/layer';
import CircleStyle from '../../../_types/CircleStyle';
import isEqual from 'lodash.isequal';

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
      if (!isEqual(newVal, oldVal) && this.viewModel) {
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
  loaded() {
    let options = JSON.parse(JSON.stringify(this.$props));
    delete options.data;
    this.viewModel = new ClusterLayerViewModel(this.map, this.data, { ...options });
  },
  render() {}
};
</script>
