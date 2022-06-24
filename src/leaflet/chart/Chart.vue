<script>
import MapGetter from 'vue-iclient/src/leaflet/_mixin/map-getter';
import ChartCommon from 'vue-iclient/src/common/chart/ChartMixin.vue';
import ChartViewModel from './ChartViewModel';
import 'vue-iclient/static/libs/iclient-leaflet/iclient-leaflet.min';

export default {
  name: 'SmChart',
  mixins: [ChartCommon, MapGetter],
  loaded() {
    this.viewModel = new ChartViewModel(this.map);
  },
  beforeDestroy() {
    this.$options.removed.call(this);
  },
  removed() {
    this.clearPopup();
  },
  methods: {
    clearPopup() {
      this.viewModel && this.viewModel.clear();
    }
  }
};
</script>
