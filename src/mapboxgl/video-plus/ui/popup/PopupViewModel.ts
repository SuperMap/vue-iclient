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
    this.options = options;
    this.init();
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.map = videoPlus.map;
    this.init();
  }

  init() {
    this.popup = new mapboxgl.Popup(this.options);
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
    this.cacheCoords = coordinate;
    this._setData();
    return this;
  }

  addToMap() {
    this.popup.addTo(this.map);
    return this;
  }

  _setData() {
    if (this.cacheCoords) {
      let latlng = this.videoPlus.transformPointToLatLng(this.cacheCoords);
      this.popup.setLngLat(latlng).addTo(this.map);
    }
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
