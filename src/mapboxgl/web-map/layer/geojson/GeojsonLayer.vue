<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import GeojsonLayerViewModel from './GeojsonLayerViewModel';
import isEqual from 'lodash.isequal';

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
    data(newVal, oldVal) {
      if (!isEqual(newVal, oldVal) && this.viewModel) {
        this.viewModel.setData(this.data);
      }
    }
  },
  loaded() {
    this.viewModel = new GeojsonLayerViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
