import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import envelope from '@turf/envelope';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import { FeatureCollection } from 'geojson';

export default class AnimateMarkerLayerViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  features: FeatureCollection;

  markers: mapboxglTypes.Marker[];

  markersElement: HTMLElement[];

  fitBounds: boolean;

  layerId: string;

  updateLayerFn: (data?: mapboxglTypes.MapStyleDataEvent) => void;

  constructor(layerId, features: FeatureCollection, markersElement: HTMLElement[], fitBounds = true) {
    super();
    this.layerId = layerId;
    this.features = features;
    this.markers = [];
    this.markersElement = markersElement;
    this.fitBounds = fitBounds;
    this.updateLayerFn = this._updateLayer.bind(this);
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

  public setFeatures(features, markersElement, fitBounds?) {
    this.markersElement = markersElement;
    this.features = features;
    this._initalizeMarkerLayer(fitBounds);
  }

  public setLayerId(layerId) {
    if (!this.features || JSON.stringify(this.features) === '{}') {
      return;
    }
    this.removed();
    this.layerId = layerId;
    this._createMarker();
  }

  private _initalizeMarkerLayer(fitBounds?) {
    if (!this.features || JSON.stringify(this.features) === '{}') {
      return;
    }
    this.removed();
    this._createMarker(fitBounds);
  }

  private _createMarker(fitBounds = true) {
    if (
      this.markersElement.length === 0 ||
      !this.map ||
      !this.features ||
      !this.features.features ||
      this.features.features.length === 0
    ) {
      return;
    }

    this.map.addLayer({
      id: this.layerId,
      type: 'circle',
      source: {
        type: 'geojson',
        data: this.features
      },
      layout: {
        visibility: 'visible'
      },
      paint: {
        'circle-radius': 0
      }
    });

    this.map.on('styledata', this.updateLayerFn);

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
    if (this.fitBounds && fitBounds) {
      // @ts-ignore
      const bounds = bbox(transformScale(envelope(this.features), 1.7));
      this.fitBounds &&
        this.map.fitBounds(
          [
            [Math.max(bounds[0], -180), bounds[1]],
            [Math.min(bounds[2], 180), bounds[3]]
          ],
          { maxZoom: 17 }
        );
    }
  }

  private _updateLayer() {
    let layer = this.map.getLayer(this.layerId);
    if (layer) {
      this.markers.length > 0 &&
    this.markers.forEach(marker => {
      // @ts-ignore
      marker && (marker.getElement().style.display = layer.visibility === 'visible' ? 'block' : 'none');
    });
    }
  }

  public removed() {
    if (this.map) {
      if(this.map.getLayer(this.layerId)) {
        this.map.removeLayer(this.layerId);
        this.map.removeSource(this.layerId);
      }
      this.map.off('styledata', this.updateLayerFn);
    }
    this.markers.length > 0 &&
      this.markers.forEach(marker => {
        marker && marker.remove();
      });
    this.markers = [];
  }
}
