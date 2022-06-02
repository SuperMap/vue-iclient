import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

const EVENTS = ['drag', 'dragstart', 'dragend'];
export default class MarkerViewModel extends mapboxgl.Evented {
  options: Object;
  marker: any;
  fire: any;
  constructor(options) {
    super();
    this.options = options;
  }

  setVideoPlus({ videoPlus }) {
    const { map } = videoPlus;
    this.videoPlus = videoPlus;
    this.map = map;
    this.init();
  }

  init() {
    this.marker = new mapboxgl.Marker(this.options);
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
    this.cacheCoord = coordinate;
    this._setData();
    return this;
  }

  addToMap() {
    this.marker.addTo(this.map);
    return this;
  }

  setDraggable(next) {
    this.marker.setDraggable(next);
  }

  togglePopup() {
    return this.marker.togglePopup();
  }

  removed() {
    if (this.marker) {
      this.marker.remove();
    }
  }

  _setData() {
    if (this.cacheCoord) {
      const transCoords = this.videoPlus.transformPointToLatLng(this.cacheCoord);
      this.marker.setLngLat(transCoords);
    }
  }
}
