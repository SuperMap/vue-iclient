import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

const EVENTS = ['open', 'close'];

export default class PopupViewModel extends mapboxgl.Evented {
  videoPlus: any = null;
  popup: any;
  options: any;
  fire: any;
  constructor(options) {
    super();
    this.popup = new mapboxgl.Popup(options);
    this._bindEventFn = this._bindEvent.bind(this);
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.fire('load');
    EVENTS.forEach(eventName => {
      this.popup.on(eventName, this._bindEventFn);
    });
  }

  _bindEvent(e) {
    this.fire(e.type, e);
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

  setText(text) {
    this.popup.setText(text);
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
    EVENTS.forEach(eventName => {
      this.marker.off(eventName, this._bindEventFn);
    });
  }
}
