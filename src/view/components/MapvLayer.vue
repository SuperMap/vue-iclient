<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';
import MapvLayerViewModel from '../../viewmodel/MapvLayerViewModel';
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
