import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class CompassViewModel
 * @description compass viewModel（指南针vm层）.
 * @param {Object} map - 地图对象。
 * @fires CompassViewModel#mouseWheel
 * @extends mapboxgl.Evented
 */

export default class CompassViewModel extends mapboxgl.Evented {
  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }
  /**
   * @function CompassViewModel.prototype.initAngle
   * @description 获取初始化地图后的倾斜角度和俯仰角度。
   */
  initAngle() {
    return {
      angle: this.map.transform.angle,
      pitch: this.map.transform.pitch
    };
  }
  /**
   * @function CompassViewModel.prototype.resetNorth
   * @description 以动态转换的方式将地图旋转到 0 度方位角（正北方）。
   */
  resetNorth() {
    this.map.resetNorth();
  }
  /**
   * @function CompassViewModel.prototype.resetNorthPitch
   * @description 以动态转换的方式将地图旋转到 0 度方位角（正北方）和 0 度倾斜角。
   */
  resetNorthPitch() {
    this.map.resetNorthPitch();
  }
  /**
   * @function CompassViewModel.prototype._getDatasetInfoSuccess
   * @description 旋转事件监听后回调函数fn。
   * @param {Funciton} fn - 回调函数
   */
  rotateEventOn(fn) {
    //  监听vm的旋转事件，回调函数
    this.map.on('rotate', () => {
      // 旋转事件的回调fn()
      fn(this.map.transform.angle, this.map.transform.pitch);
    });
  }
}
