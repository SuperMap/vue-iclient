import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

const EVENTS = ['drag', 'dragstart', 'dragend'];
export default class MarkerViewModel extends mapboxgl.Evented {
  options: Object;
  marker: any;
  fire: any;
  videoPlus: any;
  constructor(options) {
    super();
    this.marker = new mapboxgl.Marker(options);
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.init();
  }

  init() {
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
    return this.videoPlus.setCoordinate(this.marker, coordinate);
  }

  addToMap() {
    return this.videoPlus.addToMap(this.marker);
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
}
