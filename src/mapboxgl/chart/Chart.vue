<script>
import Control from '../_mixin/control';
import MapGetter from '../_mixin/map-getter';
import ChartCommon from '../../common/chart/ChartMixin';
import ChartViewModel from './ChartViewModel';

export default {
  name: 'SmChart',
  mixins: [ChartCommon, MapGetter, Control],
  created() {
    this.viewModel = new ChartViewModel();
  },
  methods: {
    changePopupArrowStyle() {
      const popupArrow = document.querySelector('.sm-component-chart-result-popup .mapboxgl-popup-tip');
      if (popupArrow) {
        popupArrow.style.borderTopColor = this.popupBackground;
      }
    }
  }
};
</script>
