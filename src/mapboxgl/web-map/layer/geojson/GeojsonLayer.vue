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
      type: Object
    }
  },
  loaded() {
    this.viewModel = new GeojsonLayerViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
