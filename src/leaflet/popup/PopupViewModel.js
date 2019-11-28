import L from '../leaflet-wrapper';

/**
 * @class PopupViewModel
 * @description popup viewModel.
 * @extends leaflet.Evented
 */

export default class PopupViewModel extends L.Evented {
  constructor(options) {
    super();
    this.popup = null;
    this.options = options.options || {};
    this.latLng = options.latLng;
    this.content = options.content;
    this.createPopup();
  }
  /**
   * @function PopupViewModel.prototype.createPopup
   * @desc 创建popup
   */
  createPopup() {
    this.popup = L.popup(this.options);
    this.setLatLng();
    this.setContent();
  }
  /**
   * @function PopupViewModel.prototype.setContent
   * @desc 设置popup内容
   * @param {Array} content - 内容。
   */
  setContent(content = this.content) {
    if (this.popup && content) {
      this.popup.setContent(content);
    }
  }
  /**
   * @function PopupViewModel.prototype.setLatLng
   * @desc 设置latlng
   * @param {Array} latLng - 坐标
   */
  setLatLng(latLng = this.latLng) {
    if (this.popup && latLng) {
      this.popup.setLatLng(latLng);
    }
  }
  /**
   * @function PopupViewModel.prototype.getPopup
   * @desc 获取popup
   */
  getPopup() {
    return this.popup;
  }
}
