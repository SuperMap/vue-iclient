import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class ZoomViewModel
 * @description zoom viewModel（缩放控件vm层）.
 * @param {Object} map - 地图对象。
 * @fires ZoomViewModel#mouseWheel
 * @extends mapboxgl.Evented
 */

export default class ZoomViewModel extends mapboxgl.Evented {
  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map || null;
    this._initVM();
  }

  /**
   * @function ZoomViewModel.prototype._initVM
   * @description 初始化vm, 绑定mouseWheel事件
   * @private
   */
  _initVM() {
    this.map.on('wheel', e => {
      // 触发滚轮事件
      this._wheelEventFires(e);
    });
  }
  /**
   * @function ZoomViewModel.prototype.zoomIn
   * @description 放大地图。
   */
  zoomIn() {
    this.map.zoomIn();
  }

  /**
   * @function ZoomViewModel.prototype.zoomOut
   * @description 缩小。
   */
  zoomOut() {
    this.map.zoomOut();
  }

  /**
   * @function ZoomViewModel.prototype.getMaxZoom
   * @description 获取地图的最大缩放级别。
   */
  getMaxZoom() {
    return this.map.getMaxZoom();
  }
  /**
   * @function ZoomViewModel.prototype.getMinZoom
   * @description 获取地图的最小缩放级别。
   */
  getMinZoom() {
    return this.map.getMinZoom();
  }
  /**
   * @function ZoomViewModel.prototype.getZoom
   * @description 获取地图当前的缩放级别。
   */
  getZoom() {
    return this.map.getZoom();
  }
  /**
   * @function ZoomViewModel.prototype._getDatasetInfoSuccess
   * @description 设置地图的缩放级别。
   * @param {Number} zoom - 缩放级别
   */
  setZoom(zoom) {
    this.map.setZoom(zoom);
  }
  /**
   * @function ZoomViewModel.prototype._getDatasetInfoSuccess
   * @description 滚轮事件监听后回调函数fn。
   * @param {Funciton} fn - 回调函数
   */
  wheelEventOn(fn) {
    //  监听vm的滚轮事件，回调函数
    this.on('mouseWheel', e => {
      // 滚轮事件的回调fn()
      fn();
    });
  }
  /**
   * @function ZoomViewModel.prototype._wheelEventFires
   * @description 触发vm的mouseWheel事件。
   * @private
   * @param {Object} e - 地图对象
   */
  _wheelEventFires(e) {
    /**
     * @event ZoomViewModel#mouseWheel
     * @description 鼠标滚轮事件触发。
     * @property {Object} result - 返回的数据。
     */
    // this的指向是viewModel
    this.fire('mouseWheel', {
      result: e
    });
  }
  removed() {}
}
