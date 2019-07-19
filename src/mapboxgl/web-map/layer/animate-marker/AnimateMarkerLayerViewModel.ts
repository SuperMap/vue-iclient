import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import { FeatureCollection } from 'geojson';

export default class AnimateMarkerLayerViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  features: FeatureCollection;

  markers: mapboxglTypes.Marker[];

  markersElement: HTMLElement[];

  constructor(map: mapboxglTypes.Map, features: FeatureCollection, markersElement: HTMLElement[]) {
    super();
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this.features = features;
    this.markers = [];
    this.markersElement = markersElement;
    this.features && this._initalizeMarkerLayer();
  }

  public setType(markersElement: HTMLElement[]) {
    this.markersElement = markersElement;
    this._initalizeMarkerLayer();
  }

  public setFeatures(features, markersElement) {
    this.markersElement = markersElement;
    this.features = features;
    this._initalizeMarkerLayer();
  }

  private _initalizeMarkerLayer() {
    this._clearMarkerLayer();
    this._createMarker();
  }
  private _createMarker() {
    this.features.features.forEach((point, index) => {
      let marker = new mapboxgl.Marker(this.markersElement[index] || this.markersElement[0])
        // @ts-ignore
        .setLngLat(point.geometry.coordinates)
        .addTo(this.map);
      this.markers.push(marker);
    }, this);
  }

  private _clearMarkerLayer() {
    this.markers.length > 0 &&
      this.markers.forEach(marker => {
        marker && marker.remove();
      });
    this.markers = [];
  }
}
