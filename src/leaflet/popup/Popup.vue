<script>
import Popper from '../_mixin/Popper.js';
import Options from '../_mixin/Options.js';
import VmUpdater from '../../common/_mixin/VmUpdater';
import Theme from '../../common/_mixin/Theme';
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
    getBackground() {
      this.changePopupStyle();
    },
    options() {
      this.loaded();
    }
  },
  loaded() {
    this.setViewModel();
    this.mapObject = this.viewModel.getPopup();
    this.parentContainer = this.$parent;
    // 如果有父组件有mapObject,则可以绑定在上面(默认绑定在map上面)
    let parentContainerObject = (this.parentContainer && this.parentContainer.mapObject) || this.map;
    if (parentContainerObject) {
      // 如果有bindpopup方法的就绑定
      if (parentContainerObject.bindPopup) {
        parentContainerObject.bindPopup(this.mapObject);
        this.$nextTick(() => {
          this.$emit('ready', this.mapObject);
        });
        return;
      }
      // 如果是地图，则openOn(this.map)
      this.isMap = this.viewModel.isMap(parentContainerObject);
      if (this.isMap) {
        parentContainerObject.on('click', e => {
          let latLng = this.map.layerPointToLatLng(e.layerPoint);
          this.viewModel.setLatLng(latLng);
          // 通过slot进来的content
          if (this.$el && this.$el.style) {
            this.$el.style.display = 'block';
          }
          this.$nextTick(() => {
            this.$emit('ready', this.mapObject);
          });
          this.$on('ready', this.viewModel.openOnMap);
        });
      }
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
      this.viewModel = new PopupViewModel(this.map, {
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
        popupContent.style.background = this.getBackground;
      }
      if (popupTip) {
        popupTip.style.background = this.getBackground;
      }
      if (popupCloseBtn) {
        popupTip.style.color = this.textColorsData;
      }
    }
  }
};
</script>
