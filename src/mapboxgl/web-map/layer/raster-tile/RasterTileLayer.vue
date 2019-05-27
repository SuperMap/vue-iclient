<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import RasterTileLayerViewModel from './RasterTileLayerViewModel';

export default {
  name: 'SmRasterTileLayer',
  mixins: [MapGetter, Layer],
  props: {
    tileSize: {
      type: Number
    },
    mapUrl: {
      type: String
    },
    tiles: {
      type: Array
    },
    bounds: {
      type: Array
    },
    attribution: {
      type: String
    },
    scheme: {
      type: String,
      default: 'xyz',
      validator(scheme) {
        return ['xyz', 'tms'].indexOf(scheme) !== -1;
      }
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
