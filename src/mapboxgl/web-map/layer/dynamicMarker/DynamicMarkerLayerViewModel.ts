import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import { FeatureCollection } from 'geojson';

type markerType = 'breathingAperture' | 'rotatingAperture';
export default class DynamicMarkerLayerViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  layerId: string;

  features: FeatureCollection;

  type: markerType;

  circleStyle: any;

  markers: mapboxglTypes.Marker[];

  markersElement: HTMLElement[];

  constructor(
    map: mapboxglTypes.Map,
    features: FeatureCollection,
    markersElement: HTMLElement[],
    type: markerType = 'breathingAperture',
    circleStyle?: any,
    layerId?: string
  ) {
    super();
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this.layerId = layerId;
    this.features = features;
    this.type = type;
    this.circleStyle = circleStyle;
    this.markers = [];
    this.markersElement = markersElement;
    this._initalizeMarkerLayer();
  }

  public setType(type: markerType, markersElement: HTMLElement[]) {
    this.type = type;
    this.markersElement = markersElement;
    this._initalizeMarkerLayer();
  }

  public setCircleStyle(circleStyle): void {
    this.circleStyle = circleStyle;
  }
  private _initalizeMarkerLayer() {
    this.features.features = this.features.features.slice(0, 5);
    this._clearMarkerLayer();
    if (this.type === 'breathingAperture') {
      this.map.addLayer({
        id: this.layerId,
        type: 'circle',
        source: {
          type: 'geojson',
          data: this.features
        },
        paint: {
          'circle-color': '#409eff',
          'circle-opacity': 0.6,
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#409eff',
          'circle-stroke-opacity': 1
        }
      });
    }
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
    this.layerId && this.map.getLayer(this.layerId) && this.map.removeLayer(this.layerId);
  }
}
