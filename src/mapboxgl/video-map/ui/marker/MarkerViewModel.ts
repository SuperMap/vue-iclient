import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { videoMapParams } from '../../VideoMapViewModel';

const EVENTS = ['drag', 'dragstart', 'dragend'];

export default class MarkerViewModel extends mapboxgl.Evented {
  videoMap: videoMapParams = null;
  options: Object;
  marker: any;
  fire: any;
  constructor(options) {
    super();
    this.options = options;
  }

  setVideoMap({ videoMap }) {
    this.videoMap = videoMap;
    this.init();
  }

  init() {
    this.marker = new SuperMap.VideoMarker(this.videoMap, this.options);
    this._bindEvent();
    this.fire('load');
  }

  _bindEvent() {
    EVENTS.forEach(eventName => {
      this.marker.on(eventName, (e) => {
        this.fire(eventName, e);
      });
    });
  }

  setCoordinate(coordinate) {
    this.marker.setCoordinate(coordinate);
    return this;
  }

  addToMap() {
    this.marker.addToMap();
  }

  setDraggable(next) {
    this.marker.setDraggable(next);
  }

  togglePopup() {
    return this.marker.togglePopup();
  }

  removed() {
  }
}
