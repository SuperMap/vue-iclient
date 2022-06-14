import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import uniqueId from 'lodash.uniqueid';
import cloneDeep from 'lodash.clonedeep';
import videojs from 'video.js';
import 'flv.js';
import 'videojs-flvjs-es6';
import { featureEach, coordEach } from '@turf/meta';

export const MAP_DRAW_EVENTS = [
  'draw.create',
  'draw.delete'
];

export const LAYER_EVENTS = [
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'contextmenu'
];

export const EVENTS = [
  'resize',
  'remove',
  'movestart',
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
 * @param {string} options.url - 视频地址。
 * @param {string} [options.target='video'] - 视频+ ID。
 * @param {string} [options.videoWidth] - 视频宽度。
 * @param {string} [options.videoHeight] - 视频高度。
 * @param {String} [options.autoplay=false] - 是否自动播放。
 * @param {boolean} [options.loop=false] - 是否循环播放。
 * @fires videoPlusViewModel#videoPlusloaded
 */

interface VideoPlusOptions {
  target: string;
  url: string;
  videoWidth?: number;
  videoHeight?: number;
  autoplay?: boolean;
  loop?: boolean;
}

export default class VideoPlusViewModel extends mapboxgl.Evented {
  fire: any;
  target: string;
  width: number;
  height: number;
  videoHeight: number;
  videoWidth: number;
  _bindMapEventFn: Function;
  _bindDrawEventFn: Function;
  _bindLayerEventFn: Function;
  id: string;
  loop: boolean;
  autoplay: boolean;
  map: mapboxglTypes.Map;
  originCoordsRightBottom: any;
  originCoordsLeftTop: any;
  video: Object;
  url: string;
  videoDomId: string;
  beforeLayerId: string;
  constructor(options: VideoPlusOptions) {
    super();
    this._bindMapEventFn = this._bindMapEvent.bind(this);
    this._bindDrawEventFn = this._bindDrawEvent.bind(this);
    this._layerEventMap = {};
    this.init(options);
  }

  async init(options) {
    const { target, url, autoplay, loop, videoWidth, videoHeight } = options;
    this.id = uniqueId('videoLayer_');
    this.autoplay = autoplay;
    this.loop = loop;
    this.target = target;
    // @ts-ignore
    this.map = await this._createMap();
    this.url = url;
    this.add(videoWidth, videoHeight);
    this._bindEvents();
  }

  add(videoWidth, videoHeight) {
    if (!this.url) {
      return;
    }
    this.video = this._createVideo();
    // @ts-ignore
    this.videoWidth = videoWidth || this.map.getCanvas().width;
    // @ts-ignore
    this.videoHeight = videoHeight || this.map.getCanvas().height;
    this.videoDomId = this._getVideoDom();
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
        setTimeout(() => {
          if (this.autoplay) {
            this.play();
          } else {
            this.pause();
          }
        }, 100);
      }, 0);
    });
  }

  addControl(control, position) {
    this.map.addControl(control, position);
    MAP_DRAW_EVENTS.forEach((eventName) => {
      // @ts-ignore
      this.map.on(eventName, this._bindDrawEventFn);
    });
  }

  _bindDrawEvent(e) {
    if (e) {
      coordEach(e.features[0], (coord) => {
        let pixelPoint = this.transformLatLngToPoint(coord);
        coord[0] = pixelPoint[0];
        coord[1] = pixelPoint[1];
      });
    }
    this.fire(e.type, { e });
  }

  removeControl(control) {
    this.map.removeControl(control);
    MAP_DRAW_EVENTS.forEach(eventName => {
      // @ts-ignore
      this.map.off(eventName, this.__bindDrawEventFn);
    });
  }

  addToMap(control) {
    control.addTo(this.map);
  }

  setCoordinate(control, coordinate) {
    if (this.originCoordsRightBottom || this.originCoordsLeftTop) {
      coordinate = this.transformPointToLatLng(coordinate);
      return control.setLngLat(coordinate);
    }
  }

  setPaintProperty(layerId, name, value) {
    this.map.setPaintProperty(layerId, name, value);
    return this;
  }

  setLayoutProperty(layerId, name, value) {
    this.map.setLayoutProperty(layerId, name, value);
    return this;
  }

  addLayer(layer) {
    const { source, id } = layer;
    const newData = this.eachData(cloneDeep(source.data));
    layer.source.data = newData;
    this.map.addLayer(layer);
    this._layerEventMap[id] = this._bindLayerEvent.bind(this, id);
    LAYER_EVENTS.forEach(eventName => {
      // @ts-ignore
      this.map.on(eventName, id, this._layerEventMap[id]);
    });
    return this;
  }

  _bindLayerEvent(id, e) {
    if (e.lngLat) {
      if (this.originCoordsRightBottom && this.originCoordsLeftTop && this.videoWidth && this.videoHeight) {
        let coord = [e.lngLat.lng, e.lngLat.lat];
        let pixelPoint = this.transformLatLngToPoint(coord);
        e.pixelPoint = [pixelPoint[0], pixelPoint[1]];
      }
    }
    this.fire(e.type, { event: e, layerId: id });
  }

  eachData(features) {
    if (!this.originCoordsRightBottom && !this.originCoordsLeftTop) {
      return [];
    }
    featureEach(features, (currentFeature) => {
      // @ts-ignore
      coordEach(currentFeature, (curCoords) => {
        let transCoords = cloneDeep(curCoords);
        curCoords.length = 0;
        if (transCoords.length) {
          curCoords.push(
            ...this.transformPointToLatLng(transCoords)
          );
        }
      });
    });
    return features;
  }

  setData(id, data) {
    const newData = this.eachData(cloneDeep(data));
    // @ts-ignore
    this.map.getSource(id).setData(newData);
  }

  removeLayer(id) {
    this.map.removeLayer(id);
    LAYER_EVENTS.forEach(eventName => {
      // @ts-ignore
      this.map.off(eventName, layerId, this._layerEventMap[id]);
    });
    delete this._layerEventMap[id];
    return this;
  }

  getLayer(layerId) {
    this.map.getLayer(layerId);
    return this;
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

  resize() {
    this._mapExisted() && this.map.resize();
  }

  _createVideo() {
    this._createVideoElement();
    let options = this._getVideoOptions();
    return videojs(this.id, options, () => {});
  }

  _getVideoOptions() {
    let options = {
      autoplay: true,
      muted: true
    };
    // @ts-ignore
    options.loop = this.loop !== false;
    if (this.url.includes('mp4')) {
      options['sources'] = [
        {
          src: this.url,
          type: 'video/mp4'
        }
      ];
    } else if (this.url.includes('flv')) {
      options = {
        autoplay: this.autoplay,
        // @ts-ignore
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
            src: this.url,
            type: 'video/x-flv'
          }
        ]
      };
    } else if (this.url.includes('m3u8')) {
      options['sources'] = [
        {
          src: this.url
        }
      ];
    }
    return options;
  }

  _getVideoDom() {
    let videoDomId;
    if (this.url.includes('flv')) {
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
    const { width, height, videoWidth, videoHeight } = this;
    let videoBounds = this._calcCoords({ width, height, videoWidth, videoHeight });
    const videoBoundsFormat = videoBounds.map((obj) => {
      return [obj.lng, obj.lat];
    });
    let url = this.videoDomId || this.url;
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
    // this.map.fitBounds([videoBounds[1], videoBounds[3]]);
    this._afterAddVideoLayer();
  }

  _afterAddVideoLayer() {
    this.fire('videolayeradded', {
      originCoordsRightBottom: this.originCoordsRightBottom,
      originCoordsLeftTop: this.originCoordsLeftTop
    });
    this.fire('load', { videoPlus: this, map: this.map });
  }

  _calcCoords({ width, height, videoWidth, videoHeight }) {
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
    // @ts-ignore
    this.video && this.video.play();
  }

  pause() {
    // @ts-ignore
    this.video && this.video.pause();
  }

  changeVideoSize(videoWidth, videoHeight) {
    const { width, height } = this;
    if (!width || !height || !this.map) {
      return;
    }
    let videoBounds = this._calcCoords({ width, height, videoWidth, videoHeight });
    const videoBoundsFormat = videoBounds.map((obj) => {
      return [obj.lng, obj.lat];
    });
    if(this.map.getSource(this.id)) {
      // @ts-ignore
      this.map.getSource(this.id).setCoordinates(videoBoundsFormat);
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
      // @ts-ignore
      map.on('load', () => {
        resolve(map);
      });
    });
  }

  removed() {
    if (this.id && this.map) {
      this.map.getLayer(this.id) && this.map.removeLayer(this.id);
      this.map.getSource(this.id) && this.map.removeSource(this.id);
    }
    this._clearEvents();
    if (this._mapExisted()) {
      this.map.remove();
      this.map = null;
    }
    this.video = null;
    this._layerEventMap = null;
  }

  _mapExisted() {
    return !!this.map;
  }

  _bindEvents() {
    EVENTS.forEach((eventName) => {
      // @ts-ignore
      this.map.on(eventName, this._bindMapEventFn);
    });
  }

  _clearEvents() {
    EVENTS.forEach((eventName) => {
      // @ts-ignore
      this.map.off(eventName, this._bindMapEventFn);
    });
  }

  _bindMapEvent(e) {
    if (e.lngLat) {
      if (this.originCoordsRightBottom && this.originCoordsLeftTop && this.videoWidth && this.videoHeight) {
        let coord = [e.lngLat.lng, e.lngLat.lat];
        let pixelPoint = this.transformLatLngToPoint(coord);
        e.pixelPoint = [pixelPoint[0], pixelPoint[1]];
      }
    }
    this.fire(e.type, { event: e });
  }
}
