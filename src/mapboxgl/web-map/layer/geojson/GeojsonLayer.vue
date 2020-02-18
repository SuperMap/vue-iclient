<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import GeojsonLayerViewModel from './GeojsonLayerViewModel';

export default {
  name: 'SmGeojsonLayer',
  mixins: [MapGetter, Layer],
  props: {
    layerStyle: {
      type: Object
    },
    data: {
      type: [Object, String]
    }
  },
  watch: {
    layerStyle: {
      handler() {
        this.viewModel && this.viewModel.setLayerStyle(this.layerStyle);
      },
      deep: true
    },
    data: {
      handler() {
        this.viewModel && this.viewModel.setData(this.data);
      },
      deep: true
    }
  },
  created() {
    this.viewModel = new GeojsonLayerViewModel(this.$props);
  },
  render() {}
};
</script>
