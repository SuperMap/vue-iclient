import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import envelope from '@turf/envelope';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
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
    if (!this.features || JSON.stringify(this.features) === '{}') {
      return;
    }
    this.clearMarkerLayer();
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
    // @ts-ignore
    const bounds = bbox(transformScale(envelope(this.features), 1.7));
    this.map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], { maxZoom: 17 });
  }

  public clearMarkerLayer() {
    this.markers.length > 0 &&
      this.markers.forEach(marker => {
        marker && marker.remove();
      });
    this.markers = [];
  }
}
