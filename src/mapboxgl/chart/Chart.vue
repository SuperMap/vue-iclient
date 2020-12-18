<script>
import Control from '../_mixin/control';
import MapGetter from '../_mixin/map-getter';
import ChartCommon from '../../common/chart/ChartMixin';
import ChartViewModel from './ChartViewModel';
import '../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min.js';

export default {
  name: 'SmChart',
  mixins: [ChartCommon, MapGetter, Control],
  created() {
    this.viewModel = new ChartViewModel();
  }
};
</script>
