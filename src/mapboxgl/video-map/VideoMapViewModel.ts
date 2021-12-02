import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
// import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

const MAP_EVENTS = [
  'resize',
  'webglcontextlost',
  'webglcontextrestored',
  'remove',
  'movestart',
  'load',
  'contextmenu',
  'dblclick',
  'click',
  'touchcancel',
  'touchmove',
  'touchend',
  'touchstart',
  'dataloading',
  'mousemove',
  'mouseup',
  'mousedown',
  'sourcedataloading',
  'error',
  'data',
  'styledata',
  'sourcedata',
  'mouseout',
  'styledataloading',
  'moveend',
  'move',
  'render',
  'zoom',
  'zoomstart',
  'zoomend',
  'boxzoomstart',
  'boxzoomcancel',
  'boxzoomend',
  'rotate',
  'rotatestart',
  'rotateend',
  'dragend',
  'drag',
  'dragstart',
  'pitch',
  'idle'
];

/**
 * @class VideoMapViewModel
 * @category ViewModel
 * @classdesc 对接视频地图
 * @param {Object} options - 参数。
 * @param {string} [options.container='map'] - 地图容器 ID。
 * @param {string} [options.src] - 视频地址。
 * @param {string} [options.videoWidth] - 视频宽度。
 * @param {string} [options.videoHeight] - 视频高度。
 * @param {String} [options.autoplay=false] - 是否自动播放。
 * @param {boolean} [options.loop=false] - 是否循环播放。
 * @param {boolean} [options.videoParamater] - 视频配准参数。
 * @fires VideoMapViewModel#videomaploaded
 * @fires VideoMapViewModel#timeupdate
 */

interface videoMapOptions {
  container: string;
  src: string;
  videoWidth: number;
  videoHieght: number;
  autoplay?: boolean;
  loop?: boolean;
  videoParamater?: Object;
}

interface videoParameters {
  pitch: number;
  roll: number;
  yaw: number;
  x: number;
  y: number;
  z: number;
  cx: number;
  cy: number;
  fx: number;
  fy: number;
}

export interface videoMapParams {
  container: string;
  src: string;
  videoWidth: number;
  videoHieght: number;
  autoplay?: boolean;
  loop?: boolean;
  videoParamater?: Object;
  play: () => { return };
  pause: () => { return };
  destroy: () => { return };
  setVideoParameters: (videoParamater) => { return };
  setPaintProperty: (layerId, prop, value) => { return };
  setLayoutProperty: (layerId, prop, value) => { return };
  addControl: (instance, position) => { return };
  removeControl: (instance) => { return };
}

export default class VideoMapViewModel extends mapboxgl.Evented {
  _bindMapEventFn: Function;
  videoMap: videoMapParams;
  fire: any;
  constructor(options: videoMapOptions) {
    super();
    this._bindMapEventFn = this._bindMapEvent.bind(this);
    this.init(options);
  }

  init(options) {
    this.videoMap = new SuperMap.VideoMap(options);
    this._bindEvents();
  }

  setVideoParameters(videoParameters: videoParameters) {
    this.videoMap && this.videoMap.setVideoParameters(videoParameters);
  }

  play() {
    this.videoMap.play();
  }

  pause() {
    this.videoMap.pause();
  }

  _bindEvents() {
    MAP_EVENTS.forEach(eventName => {
      // @ts-ignore
      this.videoMap.on(eventName, this._bindMapEventFn);
    });
    // @ts-ignore
    this.videoMap.on('load', () => {
      this.fire('load', { videoMap: this.videoMap });
    });
    // @ts-ignore
    this.videoMap.on('timeupdate', ({ time }) => {
      this.fire('timeupdate', { time });
    });
  }

  setPaintProperty(layerId, propertyName, propertyValue) {
    this.videoMap.setPaintProperty(layerId, propertyName, propertyValue);
  }

  setLayoutProperty(layerId, propertyName, propertyValue) {
    return this.videoMap.setLayoutProperty(layerId, propertyName, propertyValue);
  }

  destroy() {
    this.videoMap.destroy();
  }

  _bindMapEvent(e) {
    this.fire(e.type, e);
  }

  _clearEvents() {
    MAP_EVENTS.forEach(eventName => {
      // @ts-ignore
      this.videoMap.off(eventName, this._bindMapEventFn);
    });
  }
}
