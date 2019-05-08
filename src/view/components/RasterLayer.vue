<script>
import MapGetter from "../mixin/map-getter";
import Layer from "../mixin/layer";
import RasterLayerViewModel from "../../viewmodel/RasterLayerViewModel";
export default {
  name: "SmRasterLayer",
  mixins: [MapGetter, Layer],
  props: {
    name: {
      type: String
    },
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
    minZoom: {
      type: Number,
      default: 0
    },
    maxZoom: {
      type: Number,
      default: 22
    },
    attribution: {
      type: String
    },
    scheme: {
      type: String,
      default: "xyz",
      validator(scheme) {
        return ["xyz", "tms"].indexOf(scheme) !== -1;
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
    },
    before: {
      type: String
    }
  },
  loaded() {
    this.viewModel = new RasterLayerViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
