import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance.css';

const EVENTS = ['open', 'close'];

export default class PopupViewModel extends mapboxgl.Evented {
  videoPlus: any = null;
  popup: any;
  options: any;
  fire: any;
  constructor(options) {
    super();
    this.popup = new mapboxgl.Popup(options);
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
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
    return this.videoPlus.setCoordinate(this.popup, coordinate);
  }

  addToMap() {
    return this.videoPlus.addToMap(this.popup);
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

  remvoed() {
    if (this.popup) {
      this.popup.remove();
    }
  }
}
