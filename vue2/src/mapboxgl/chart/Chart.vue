<script>
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import ChartCommon from 'vue-iclient/src/common/chart/ChartMixin.vue';
import ChartViewModel from 'vue-iclient-controllers-mapboxgl/src/ChartViewModel';

export default {
  name: 'SmChart',
  mixins: [ChartCommon, MapGetter, Control],
  created() {
    this.viewModel = new ChartViewModel();
  }
};
</script>
