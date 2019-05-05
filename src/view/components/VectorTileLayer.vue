<script>
import Widget from "./Widget";
export default {
  name: "SmVectorTileLayer",
  extends: Widget,
  relativeMap: true,
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