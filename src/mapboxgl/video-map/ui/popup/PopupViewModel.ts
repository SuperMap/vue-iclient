import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import { videoMapParams } from '../../VideoMapViewModel';

const EVENTS = ['open', 'close'];

export default class PopupViewModel extends mapboxgl.Evented {
  videoMap: videoMapParams = null;
  popup: any;
  options: any;
  fire: any;
  constructor(options) {
    super();
    this.options = options;
    this.init();
  }

  setVideoMap({ videoMap }) {
    this.videoMap = videoMap;
    this.init();
  }

  init() {
    this.popup = new SuperMap.VideoPopup(this.videoMap, this.options);
    this._bindEvent();
    this.fire('load');
  }

  _bindEvent() {
    EVENTS.forEach(eventName => {
      this.popup.on(eventName, e => {
        this.fire(eventName, e);
      });
    });
  }

  setCoordinate(coordinate) {
    this.popup.setCoordinate(coordinate);
    return this;
  }

  addToMap() {
    this.popup.addToMap();
  }

  setDOMContent(htmlNode) {
    this.popup.setDOMContent(htmlNode);
  }

  setPopup(marker) {
    marker.setPopup(this.popup);
  }

  isOpen() {
    return this.popup.isOpen();
  }

  remvoed() {}
}
