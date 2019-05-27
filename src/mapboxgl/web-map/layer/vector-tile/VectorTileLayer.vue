<script>
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';

export default {
  name: 'SmVectorTileLayer',
  mixins: [MapGetter, Layer],
  props: {
    styleOptions: {
      type: [String, Object]
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
