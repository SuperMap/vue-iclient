
<script>
import MapGetter from 'vue-iclient/src/leaflet/_mixin/map-getter';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MarkerViewModel from './MarkerViewModel';
import Options from 'vue-iclient/src/leaflet/_mixin/Options.js';

export default {
  name: 'SmMarker',
  mixins: [MapGetter, Theme, Options],
  props: {
    latLng: {
      type: [Object, Array],
      default: () => []
    }
  },
  data() {
    return {
      ready: false
    };
  },
  watch: {
    options() {
      this.setViewModel();
    }
  },
  loaded() {
    this.setViewModel();
    this.mapObject = this.viewModel.getMarker();
    this.ready = true;
  },
  methods: {
    setViewModel() {
      this.viewModel = new MarkerViewModel(this.map, {
        latLng: this.latLng
      });
    }
  },
  render: function(h) {
    if (this.ready && this.$slots.default) {
      return h('div', { style: { display: 'none' } }, this.$slots.default);
    }
    return null;
  }
};
</script>
