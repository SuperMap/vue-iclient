<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import MapvLayerViewModel from './MapvLayerViewModel';

export default {
  name: 'SmMapvLayer',
  mixins: [MapGetter, Layer],
  props: {
    data: {
      type: Object,
      default() {
        return {};
      }
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  loaded() {
    this.viewModel = new MapvLayerViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
