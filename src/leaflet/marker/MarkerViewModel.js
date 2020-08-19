import L from '../leaflet-wrapper';
import '../../../static/libs/iclient-leaflet/iclient-leaflet.min.js';
/**
 * @class MarkerViewModel
 * @description 点选 viewModel.
 * @param {Object} map - map 对象。
 * @param {String} [options.latlng] - 图层名。
 * @extends L.Evented
 */

export default class MarkerViewModel extends L.Evented {
  constructor(map, options) {
    super();
    this.map = map;
    this.latLng = options.latLng;
    this.marker = null;
    this.createMarker();
  }
  createMarker(latLng = this.latLng) {
    this.marker = L.circleMarker(latLng).addTo(this.map);
  }
  /**
   * @function MarkerViewModel.prototype.getMarker
   * @desc 获取marker
   */
  getMarker() {
    return this.marker;
  }
}
