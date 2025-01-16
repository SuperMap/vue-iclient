<script>
import MapGetter from 'vue-iclient/src/leaflet/_mixin/map-getter';
import TileLayerViewModel from './TileLayerViewModel';
import { capitalizeFirstLetter } from 'vue-iclient/src/leaflet/_utils/props-binder';
import TileLayer from 'vue-iclient/src/leaflet/_mixin/TileLayer';

export default {
  name: 'SmTileLayer',
  mixins: [MapGetter, TileLayer],
  props: {
    layersID: {
      type: String
    },
    redirect: {
      type: Boolean,
      default: false
    },
    cacheEnabled: {
      type: Boolean,
      default: true
    },
    clipRegionEnabled: {
      type: Boolean,
      default: false
    },
    prjCoordSys: {
      type: Object
    },
    overlapDisplayed: {
      type: Boolean,
      default: false
    },
    overlapDisplayedOptions: {
      type: String
    },
    tileversion: {
      type: String
    },
    serverType: {
      type: String,
      default: 'iServer'
    },
    tileProxy: {
      type: String
    },
    format: {
      type: String,
      default: 'png',
      validator: function(val) {
        return ['png', 'jpg', 'bmp', 'gif'].indexOf(val) !== -1;
      }
    },
    tileSize: {
      type: Number,
      default: 256
    },
    url: {
      type: String
    },
    transparent: {
      type: Boolean,
      default: true
    },
    clipRegion: {
      type: Object
    },
    crs: {
      type: Object
    }
  },
  created() {
    for (let key in this.$props) {
      const setMethodName = 'set' + capitalizeFirstLetter(key);
      if (!this[setMethodName]) {
        this[setMethodName] = function(newValue) {
          this.viewModel && this.viewModel[setMethodName](newValue);
        };
      }
    }
    this.viewModel = new TileLayerViewModel(this.$props);
    this.layer = this.viewModel.getLayer();
  },
  loaded() {
    this.viewModel.addTo(this.map);
  },
  render() {}
};
</script>
