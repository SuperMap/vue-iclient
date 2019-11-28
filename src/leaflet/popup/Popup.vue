<script>
import Popper from '../_mixin/Popper.js';
import Options from '../_mixin/Options.js';
import VmUpdater from '../../common/_mixin/vm-updater';
import Theme from '../../common/_mixin/theme';
import MapGetter from '../_mixin/map-getter';
import PopupViewModel from './PopupViewModel';

export default {
  name: 'SmPopup',
  mixins: [Popper, Options, VmUpdater, MapGetter, Theme],
  viewModelProps: ['latLng', 'content'],
  props: {
    latLng: {
      type: [Object, Array],
      default: () => []
    }
  },
  watch: {
    backgroundData() {
      this.changePopupStyle();
    },
    options() {
      this.setViewModel();
    }
  },
  loaded() {
    this.setViewModel();
    this.mapObject = this.viewModel.getPopup();
    this.parentContainer = this.$parent;
    // 如果有父组件有mapObject,则可以绑定在上面
    if (this.parentContainer.mapObject && this.parentContainer.mapObject.bindPopup) {
      this.parentContainer.mapObject.bindPopup(this.mapObject);
      this.$nextTick(() => {
        this.$emit('ready', this.mapObject);
      });
    }
  },
  beforeDestroy() {
    if (this.parentContainer) {
      if (this.parentContainer.unbindPopup) {
        this.parentContainer.unbindPopup();
      } else if (this.parentContainer.mapObject && this.parentContainer.mapObject.unbindPopup) {
        this.parentContainer.mapObject.unbindPopup();
      }
    }
  },
  methods: {
    setViewModel() {
      this.viewModel = new PopupViewModel({
        latLng: this.latLng,
        content: this.content || this.$el,
        options: this.options
      });
    },
    changePopupStyle() {
      const popupContent = document.querySelector('.leaflet-popup-content-wrapper');
      const popupTip = document.querySelector('.leaflet-popup-tip');
      const popupCloseBtn = document.querySelector('.leaflet-container a.leaflet-popup-close-button:hover');
      if (popupContent) {
        popupContent.style.background = this.backgroundData;
      }
      if (popupTip) {
        popupTip.style.background = this.backgroundData;
      }
      if (popupCloseBtn) {
        popupTip.style.color = this.textColorsData;
      }
    }
  }
};
</script>
