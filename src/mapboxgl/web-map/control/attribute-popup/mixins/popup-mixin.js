import MapPopupViewModel from 'vue-iclient/src/mapboxgl/map-popup/MapPopupViewModel';
import { setPopupArrowStyle } from 'vue-iclient/src/common/_utils/util';

/**
 * Popup Mixin - 管理弹窗的显示、添加、移除
 */
export default {
  data() {
    return {
      isRender: false
    };
  },
  created() {
    this.initPopupViewModel();
  },
  loaded() {
    this.popupViewModel.setMap({ map: this.map });
  },
  methods: {
    initPopupViewModel() {
      if (!this.popupViewModel) {
        this.popupViewModel = new MapPopupViewModel();
      }
      return this.popupViewModel;
    },

    removePopup() {
      if (this.popupViewModel) {
        this.popupViewModel.removePopup();
        this.isRender = false;
      }
    },

    addPopup(coordinate, popupEl, popupBgStyle) {
      const coord = coordinate;
      if (!coord || !coord.length) return;

      this.isRender = true;
      if (this.popupViewModel && popupEl) {
        this.popupViewModel.addPopup(coord, popupEl);
        if (popupBgStyle) {
          setPopupArrowStyle(popupBgStyle.backgroundColor);
        }
      }
    },

    clearPopup() {
      if (this.popupViewModel) {
        this.popupViewModel.removed();
        this.isRender = false;
      }
    }
  },

  beforeDestroy() {
    this.clearPopup();
  }
};
