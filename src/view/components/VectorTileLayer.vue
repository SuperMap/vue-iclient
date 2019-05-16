<script>
import MapGetter from '../mixin/map-getter';
import Layer from '../mixin/layer';

export default {
  name: 'SmVectorTileLayer',
  mixins: [MapGetter, Layer],
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
