import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance-dev';
import 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance.css';
import uniqueId from 'lodash.uniqueid';
import videojs from 'video.js';
import 'flv.js';
import 'videojs-flvjs-es6';

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
 * @class videoPlusViewModel
 * @category ViewModel
 * @classdesc 对接视频+
 * @param {Object} options - 参数。
 * @param {string} [options.target='map'] - 地图容器 ID。
 * @param {string} [options.src] - 视频地址。
 * @param {String} [options.autoplay=false] - 是否自动播放。
 * @param {boolean} [options.loop=false] - 是否循环播放。
 * @fires videoPlusViewModel#videoPlusloaded
 */

interface VideoPlusOptions {
  target: string;
  src: string;
  autoplay?: boolean;
  loop?: boolean;
}

export default class VideoPlusViewModel extends mapboxgl.Evented {
  fire: any;
  target: any;
  width: number;
  height: number;
  videoHeight: number;
  videoWidth: number;
  _playFn: Function;
  _bindMapEventFn: Function;
  id: string;
  loop: boolean;
  autoplay: boolean;
  map: mapboxglTypes.Map;
  timerId: string;
  originCoordsRightBottom: any;
  originCoordsLeftTop: any;
  video: Object;
  timer: any;
  src: string;
  videoDomId: string;
  beforeLayerId: string;
  constructor(options: VideoPlusOptions) {
    super();
    this._bindMapEventFn = this._bindMapEvent.bind(this);
    this._playFn = this._play.bind(this);
    this.init(options);
  }

  async init(options) {
    const { target, src, autoplay, loop } = options;
    this.id = uniqueId('videoLayer_');
    this.autoplay = autoplay;
    this.loop = loop;
    this.target = target;
    // @ts-ignore
    this.map = await this._createMap();
    this.src = src;
    this.add();
    this._bindEvents();
  }

  add() {
    if (!this.src) {
      return;
    }
    this.video = this._createVideo();
    // @ts-ignore
    this.videoWidth = this.map.getCanvas().width;
    // @ts-ignore
    this.videoHeight = this.map.getCanvas().height;
    this.videoDomId = this._getVideoDom();
    console.log('this.video', this.video);
    // @ts-ignore
    this.video.one('firstplay', () => {
      if (this.autoplay) {
        this.play();
      }
    });
    // @ts-ignore
    this.video.one('canplay', () => {
      setTimeout(() => {
        this._addVideoLayer(this.map);
      }, 1000);
    });
  }

  _createVideo() {
    this._createVideoElement();
    let options = this._getVideoOptions();
    return videojs(this.id, options);
  }

  _getVideoOptions() {
    let options = {};
    // @ts-ignore
    options.autoplay = 'muted';
    // @ts-ignore
    options.loop = this.loop !== false;
    if (this.src.includes('mp4')) {
      options['sources'] = [
        {
          src: this.src,
          type: 'video/mp4'
        }
      ];
    } else if (this.src.includes('flv')) {
      options = {
        autoplay: this.autoplay,
        techOrder: ['html5', 'flvjs'],
        flvjs: {
          mediaDataSource: {
            isLive: true,
            cors: true,
            withCredentials: false
          }
        },
        sources: [
          {
            src: this.src,
            type: 'video/x-flv'
          }
        ]
      };
    } else if (this.src.includes('m3u8')) {
      options['sources'] = [
        {
          src: this.src
        }
      ];
    }
    return options;
  }

  _getVideoDom() {
    let videoDomId;
    if (this.src.includes('flv')) {
      let videoWrap = document.querySelector(`#${this.id}`);
      videoDomId = `${this.id}_flvjs_api`;
      // @ts-ignore
      videoWrap.style.position = 'fixed';
      // @ts-ignore
      videoWrap.style.left = '-200%';
    } else {
      // @ts-ignore
      videoDomId = this.video.el_.firstChild.id;
    }
    return videoDomId;
  }

  _createVideoElement() {
    let video = document.createElement('video');
    video.id = this.id;
    video.className = 'video-js';
    video.style.position = 'fixed';
    video.style.left = '-200%';
    video.setAttribute('crossorigin', 'anonymous');
    document.body.appendChild(video);
  }

  _addVideoLayer(map) {
    let videoBounds = this._calcCoords();
    const videoBoundsFormat = videoBounds.map((obj) => {
      return [obj.lng, obj.lat];
    });
    let url = this.videoDomId || this.src;
    map.addSource(this.id, {
      type: 'video',
      urls: [url],
      coordinates: videoBoundsFormat
    });

    if (map.getStyle().layers.length >= 1) {
      this.beforeLayerId = map.getStyle().layers[0].id;
    }
    map.addLayer(
      {
        id: this.id,
        type: 'raster',
        source: this.id
      },
      this.beforeLayerId
    );
    this.map.fitBounds([videoBounds[1], videoBounds[3]]);
    this._afterAddVideoLayer();
  }

  _afterAddVideoLayer() {
    this.fire('videolayeradded', {
      originCoordsRightBottom: this.originCoordsRightBottom,
      originCoordsLeftTop: this.originCoordsLeftTop
    });
    this.fire('load', { videoPlus: this, map: this.map });
  }

  _calcCoords() {
    const { width, height, videoHeight, videoWidth } = this;
    let ratioX = videoWidth / width;
    let ratioY = videoHeight / height;
    let ratio = Math.min(ratioX, ratioY);
    let realWidth = videoWidth / ratio;
    let realHeight = videoHeight / ratio;
    let center = { x: width / 2, y: height / 2 };
    let cx = realWidth / 2;
    let cy = realHeight / 2;
    let pos = [
      [center.x - cx, center.y - cy],
      [center.x + cx, center.y - cy],
      [center.x + cx, center.y + cy],
      [center.x - cx, center.y + cy]
    ];
    let coords = pos.map((coord) => {
      // @ts-ignore
      return this.map.unproject(coord);
    });
    this.originCoordsLeftTop = coords[0];
    this.originCoordsRightBottom = coords[2];
    return coords;
  }

  play() {
    this._pause();
    // @ts-ignore
    this.video.play();
    this._play();
  }

  pause() {
    // @ts-ignore
    this.video.pause();
    this._pause();
  }

  remove() {
    if (this.id) {
      this.map.removeLayer(this.id);
      this.map.removeSource(this.id);
      document.body.removeChild(document.getElementById(this.id));
      this._pause();
    }
  }

  _play() {
    // @ts-ignore
    this.timer = requestAnimationFrame(this._playFn);
  }

  _pause() {
    if (this.timer) {
      cancelAnimationFrame(this.timer);
      this.timer = null;
    }
  }

  _createMap() {
    return new Promise((resolve) => {
      // @ts-ignore
      let map = new mapboxgl.Map({
        container: this.target,
        style: {
          version: 8,
          sources: {},
          layers: []
        },
        renderWorldCopies: false,
        center: [0, 0],
        zoom: 8
      });
      let container = map.getContainer();
      this.width = container.clientWidth || 400;
      this.height = container.clientHeight || 300;
      map.on('load', () => {
        resolve(map);
      });
    });
  }

  removed() {
    this.timerId = null;
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  _mapExisted() {
    return !!this.map;
  }

  _bindEvents() {
    MAP_EVENTS.forEach((eventName) => {
      // @ts-ignore
      this.map.on(eventName, this._bindMapEventFn);
    });
  }

  _clearEvents() {
    MAP_EVENTS.forEach((eventName) => {
      // @ts-ignore
      this.map.off(eventName, this._bindMapEventFn);
    });
  }

  _bindMapEvent(e) {
    if (e.lngLat) {
      if (this.originCoordsRightBottom && this.originCoordsLeftTop && this.videoWidth && this.videoHeight) {
        let coord = [e.lngLat.lng, e.lngLat.lat];
        let spatialPoint = this.transformLatLngToPoint(coord);
        e.spatialPoint = [spatialPoint[0], spatialPoint[1]];
      }
    }
    this.fire(e.type, { mapEvent: e });
  }

  transformPointToLatLng (pixelPoint) {
    let perWidth = Math.abs(this.originCoordsRightBottom.lng - this.originCoordsLeftTop.lng) / this.videoWidth;
    let perHeight = Math.abs(this.originCoordsRightBottom.lat - this.originCoordsLeftTop.lat) / this.videoHeight;
    return [pixelPoint[0] * perWidth + this.originCoordsLeftTop.lng, this.originCoordsLeftTop.lat - pixelPoint[1] * perHeight];
  }

  transformLatLngToPoint (coord) {
    let perWidth = Math.abs(this.originCoordsRightBottom.lng - this.originCoordsLeftTop.lng) / this.videoWidth;
    let perHeight = Math.abs(this.originCoordsRightBottom.lat - this.originCoordsLeftTop.lat) / this.videoHeight;
    return [(coord[0] - this.originCoordsLeftTop.lng) / perWidth, (this.originCoordsLeftTop.lat - coord[1]) / perHeight];
  }
}
