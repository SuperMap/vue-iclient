<script>
import MapGetter from "../mixin/map-getter";

export default {
  name: "SmVectorTileLayer",
  relativeMap: true,
  mixins: [MapGetter],
  props: {
    styleOptions: {
      type: [String, Object]
    },
    before: {
      type: String
    }
  },
  loaded() {
    if (this.map.addStyle) {
      this.map.addStyle(this.styleOptions, this.before);
    }
  },
  render() {}
};
</script>