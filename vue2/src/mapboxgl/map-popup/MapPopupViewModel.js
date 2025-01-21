import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class MapPopupViewModel
 * @description 点选 viewModel.
 * @param {Object} map - map 对象
 * @extends mapboxgl.Evented
 */
export default class MapPopupViewModel extends mapboxgl.Evented {
  constructor(map) {
    super();
    this.map = map;
    this.popup = null;
  }

  /**
   * @function MapPopupViewModel.prototype.addPopup
   * @desc 添加弹窗。
   * @param {Array} coordinates - 弹窗坐标。
   * @param {HTMLElement} popupContainer - 弹窗 DOM 对象。
   */
  addPopup(coordinates, popupContainer) {
    this.removePopup();
    if (popupContainer) {
      popupContainer.style.display = 'block';
      this.popup = new mapboxgl.Popup({
        maxWidth: 'none',
        className: 'sm-mapboxgl-map-popup sm-mapboxgl-tabel-popup',
        closeButton: false
      })
        .setLngLat(coordinates)
        .setDOMContent(popupContainer)
        .addTo(this.map);
    }
    return this.popup;
  }

  /**
   * @function MapPopupViewModel.prototype.removed
   * @desc 清除popup。
   */
  removed() {
    this.removePopup();
  }

  removePopup() {
    if (this.popup) {
      this.popup.remove() && (this.popup = null);
    }
  }
}
