<script>
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
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
    }
  },
  watch: {
    tiles(val) {
      this.viewModel && this.viewModel.setTiles(val);
    }
  },
  created() {
    this.viewModel = new RasterTileLayerViewModel(this.$props);
  },
  render() {}
};
</script>
