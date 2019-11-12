<script>
import MapGetter from '../../../_mixin/map-getter';
import RasterTileLayerViewModel from './RasterTileLayerViewModel';

export default {
  name: 'SmRasterTileLayer',
  mixins: [MapGetter],
  props: {
    tileSize: {
      type: Number
    },
    mapUrl: {
      type: String
    },
    bounds: {
      type: Array
    },
    attribution: {
      type: String
    },
    visible: {
      type: Boolean,
      default: true
    },
    opacity: {
      type: Number,
      default: 1,
      validator(opacity) {
        return opacity >= 0 && opacity <= 1;
      }
    }
  },
  loaded() {
    this.viewModel = new RasterTileLayerViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
