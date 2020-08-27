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

  fitBounds: Boolean;

  constructor(features: FeatureCollection, markersElement: HTMLElement[], fitBounds: Boolean = true) {
    super();
    this.features = features;
    this.markers = [];
    this.markersElement = markersElement;
    this.fitBounds = fitBounds;
  }

  public setMap(mapInfo) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
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
    this.removed();
    this._createMarker();
  }
  private _createMarker() {
    if (
      this.markersElement.length === 0 ||
      !this.map ||
      !this.features ||
      !this.features.features ||
      this.features.features.length === 0
    ) {
      return;
    }
    this.features.features.forEach((point, index) => {
      // @ts-ignore
      let coordinates = point.geometry.coordinates;
      if (coordinates) {
        let marker = new mapboxgl.Marker(this.markersElement[index] || this.markersElement[0])
          .setLngLat(coordinates)
          .addTo(this.map);
        this.markers.push(marker);
      }
    }, this);
    if (this.fitBounds) {
      // @ts-ignore
      const bounds = bbox(transformScale(envelope(this.features), 1.7));
      this.fitBounds &&
        this.map.fitBounds(
          [
            [bounds[0], bounds[1]],
            [bounds[2], bounds[3]]
          ],
          { maxZoom: 17 }
        );
    }
  }

  public removed() {
    this.markers.length > 0 &&
      this.markers.forEach(marker => {
        marker && marker.remove();
      });
    this.markers = [];
  }
}
