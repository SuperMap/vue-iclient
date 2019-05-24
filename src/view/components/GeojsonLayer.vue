<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import GeojsonLayerViewModel from '../../viewmodel/GeojsonLayerViewModel';

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
