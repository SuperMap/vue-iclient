<script>
import MapGetter from "../mixin/map-getter";
import MapVViewModel from "../../viewmodel/MapVViewModel";
export default {
  name: "SmMapV",
  mixins: [MapGetter],
  relativeMap: true,
  props: {
    dataSet: {
      type: Object,
      required: true,
      validator(dataSet) {
        return JSON.stringify(dataSet) !== '{}';
      }
    },
    mapvOptions: {
      type: Object,
      required: true,
      validator(mapvOptions) {
        return JSON.stringify(mapvOptions) !== '{}';
      }
    }
  },
  loaded() {
    this.viewModel = new MapVViewModel(this.map, this.$props);
  },
  render() {}
};
</script>
