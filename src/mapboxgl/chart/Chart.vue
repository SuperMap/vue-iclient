<script>
import Control from '../_mixin/control';
import MapGetter from '../_mixin/map-getter';
import ChartCommon from '../../common/chart/ChartMixin';
import ChartViewModel from './ChartViewModel';

export default {
  name: 'SmChart',
  mixins: [ChartCommon, MapGetter, Control],
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
    },
    changePopupArrowStyle() {
      const popupArrow = document.querySelector('.sm-component-chart-result-popup .mapboxgl-popup-tip');
      if (popupArrow) {
        popupArrow.style.borderTopColor = this.popupBackground;
      }
    }
  }
};
</script>
