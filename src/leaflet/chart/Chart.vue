<script>
import MapGetter from '../_mixin/map-getter';
import ChartCommon from '../../common/chart/ChartMixin';
import ChartViewModel from './ChartViewModel';
import '../../../static/libs/iclient-leaflet/iclient-leaflet.min.js';

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
    },
    changePopupArrowStyle() {
      const popupArrow = document.querySelector('.sm-component-chart-result-popup .leaflet-popup-tip');
      if (popupArrow) {
        popupArrow.style.background = this.popupBackground;
      }
    }
  }
};
</script>
