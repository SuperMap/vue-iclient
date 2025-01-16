import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';

const EVENTS = ['drag', 'dragstart', 'dragend'];
export default class MarkerViewModel extends mapboxgl.Evented {
  options: Object;
  marker: any;
  fire: any;
  _bindEventFn: Function;
  videoPlus: any;
  constructor(options) {
    super();
    this.marker = new mapboxgl.Marker(options);
    this._bindEventFn = this._bindEvent.bind(this);
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.init();
  }

  init() {
    this.fire('load', this.videoPlus);
    EVENTS.forEach(eventName => {
      this.marker.on(eventName, this._bindEventFn);
    });
  }

  _bindEvent(e) {
    this.fire(e.type, e);
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
    EVENTS.forEach(eventName => {
      this.marker.off(eventName, this._bindEventFn);
    });
  }
}
