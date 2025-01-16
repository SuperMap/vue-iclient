import L from '../leaflet-wrapper';

/**
 * @class PopupViewModel
 * @description popup viewModel.
 * @extends leaflet.Evented
 */

export default class PopupViewModel extends L.Evented {
  constructor(map, options) {
    super();
    this.map = map;
    this.mapObject = null;
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
    this.mapObject = L.popup(this.options);
    this.setLatLng();
    this.setContent();
  }

  /**
   * @function PopupViewModel.prototype.setContent
   * @desc 设置popup内容
   * @param {Array} content - 内容。
   */
  setContent(content = this.content) {
    if (this.mapObject && content) {
      this.mapObject.setContent(content);
    }
  }

  /**
   * @function PopupViewModel.prototype.setLatLng
   * @desc 设置latlng
   * @param {Array} latLng - 坐标
   */
  setLatLng(latLng = this.latLng) {
    if (this.mapObject && latLng) {
      this.mapObject.setLatLng(latLng);
    }
  }

  /**
   * @function PopupViewModel.prototype.getPopup
   * @desc 获取popup
   */
  getPopup() {
    return this.mapObject;
  }

  /**
   * @function PopupViewModel.prototype.openOnMap
   * @desc openOn MAP
   */
  openOnMap() {
    this.mapObject.openOn(this.map);
  }

  /**
   * @function PopupViewModel.prototype.openOnMap
   * @desc openOn MAP
   */
  isMap(mapObject) {
    return mapObject instanceof L.Map;
  }
}
