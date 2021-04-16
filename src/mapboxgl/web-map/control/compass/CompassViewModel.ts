import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class CompassViewModel
 * @description compass viewModel（指南针vm层）.
 * @param {Object} map - 地图对象。
 * @fires CompassViewModel#mouseWheel
 * @extends mapboxgl.Evented
 */

interface mapEnhance extends mapboxglTypes.Map {
  resetNorthPitch?: (options?: mapboxglTypes.AnimationOptions, eventData?: mapboxglTypes.EventData) => this;
}

interface optionsTypes {
  visualizePitch: boolean;
}

export default class CompassViewModel extends mapboxgl.Evented {
  map: mapEnhance;
  rotatePitchCallBack: any;
  visualizePitch: boolean;
  rotateEventFn: (data: mapboxglTypes.MapboxEvent<MouseEvent | TouchEvent | undefined>) => void;
  pitchEventFn: (data: mapboxglTypes.MapboxEvent<MouseEvent | TouchEvent | undefined>) => void;

  constructor(options: optionsTypes) {
    super();
    this.rotateEventFn = this._rotateEvent.bind(this);
    this.pitchEventFn = this._pitchEvent.bind(this);
    this.visualizePitch = options && options.visualizePitch;
  }

  setMap(mapInfo: mapInfoType) {
    const { map } = mapInfo;
    this.map = map;
    this.map.on('rotate', this.rotateEventFn);
    this.map.on('pitch', this.pitchEventFn);
  }

  setVisualizePitch(visualizePitch: boolean) {
    this.visualizePitch = visualizePitch;
  }

  /**
   * @function CompassViewModel.prototype.initAngle
   * @description 获取初始化地图后的倾斜角度和俯仰角度。
   */
  initAngle() {
    return {
      angle: this._getAngle(),
      pitch: this.map.getPitch()
    };
  }

  /**
   * @function CompassViewModel.prototype._getAngle
   * @description 获取地图的旋转角度。
   */
  _getAngle() {
    // @ts-ignore
    return this.map.transform.angle;
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
   * @function CompassViewModel.prototype._rotatePitchEventFn
   * @description 获取地图的旋转角度。
   */
  private _rotateEvent() {
    if (this.rotatePitchCallBack) {
      this.rotatePitchCallBack(this._getAngle(), this.map.getPitch());
    }
  }

  /**
   * @function CompassViewModel.prototype._rotatePitchEventFn
   * @description 获取地图的旋转角度。
   */
  private _pitchEvent() {
    if (this.visualizePitch && this.rotatePitchCallBack) {
      this.rotatePitchCallBack(this._getAngle(), this.map.getPitch());
    }
  }

  /**
   * @function CompassViewModel.prototype.changeEventOn
   * @description 倾斜或俯仰的角度改变事件监听后回调函数fn。
   * @param {Funciton} fn - 回调函数
   */
  rotateEventOn(fn: any) {
    this.rotatePitchCallBack = fn;
  }

  removed() {
    this.map.off('rotate', this.rotateEventFn);
    this.map.off('pitch', this.pitchEventFn);
  }
}
