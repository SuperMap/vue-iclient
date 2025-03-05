import type mapboxglTypes from 'mapbox-gl';
import mapboxgl from 'vue-iclient-core/libs/mapboxgl/mapbox-gl-enhance';
import envelope from '@turf/envelope';
import bbox from '@turf/bbox';
import transformScale from '@turf/transform-scale';
import BreathingApertureMarker from './animate-marker-layer/marker/BreathingApertureMarker';
import DiffusedApertureMarker from './animate-marker-layer/marker/DiffusedApertureMarker';
import HaloRingMarker from './animate-marker-layer/marker/HaloRingMarker';
import RotatingApertureMarker from './animate-marker-layer/marker/RotatingApertureMarker';
import RotatingTextBorderMarker from './animate-marker-layer/marker/RotatingTextBorderMarker';
import FluorescenceMarker from './animate-marker-layer/marker/FluorescenceMarker';


export type MarkerInstance = BreathingApertureMarker | DiffusedApertureMarker | HaloRingMarker | RotatingApertureMarker | RotatingTextBorderMarker | FluorescenceMarker;

export interface MarkerStyle {
  width: number;
  height: number;
  colors: string[];
  textFontSize: number;
  textColor: string;
  textField: string;
}

export type MarkerType =
  | 'rotatingAperture'
  | 'haloRing'
  | 'breathingAperture'
  | 'diffusedAperture'
  | 'rotatingTextBorder'
  | 'fluorescence';

export interface AnimateMarkerLayerOptions extends MarkerStyle {
  type: string;
  layerId: string;
  features: GeoJSON.FeatureCollection;
  fitBounds: boolean;
}

export default class AnimateMarkerLayerViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;

  features: GeoJSON.FeatureCollection;

  markers: mapboxglTypes.Marker[];

  markersElement: HTMLElement[];

  fitBounds: boolean;

  layerId: string;

  marker: MarkerInstance;

  options: AnimateMarkerLayerOptions;

  updateLayerFn: (data?: mapboxglTypes.MapStyleDataEvent) => void;

  constructor(options: AnimateMarkerLayerOptions) {
    super();
    const { layerId, features, fitBounds } = options;
    this.layerId = layerId;
    this.features = this._getPointFeatures(features);
    this.markers = [];
    this.fitBounds = fitBounds;
    this.options = options;
    this._getMarkerElement(this.features);
    this.updateLayerFn = this._updateLayer.bind(this);
  }

  public setMap(mapInfo: { map: mapboxglTypes.Map }) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this.features && this._initalizeMarkerLayer();
  }

  public setType(type: MarkerType) {
    this.options.type = type;
    this._getMarkerElement(this.features);
    this._initalizeMarkerLayer();
  }

  public setFeatures(features: GeoJSON.FeatureCollection) {
    const fitBounds = !this.features;
    const pointFeatures = this._getPointFeatures(features);
    this._getMarkerElement(pointFeatures);
    this.features = pointFeatures;
    this._initalizeMarkerLayer(fitBounds);
  }

  setWidth(width: number) {
    this.options.width = width;
    this.marker?.setMarkersWidth(width);
  }

  setHeight(height: number) {
    this.options.height = height;
    if (this.marker && 'setMarkersHeight' in this.marker) {
      this.marker.setMarkersHeight(height);
    }
  }

  setTextColor(textColor: string) {
    this.options.textColor = textColor;
    this.marker?.setMarkersTextColor(textColor);
  }

  setTextFontSize(textFontSize: number) {
    this.options.textFontSize = textFontSize;
    this.marker?.setMarkersTextFontSize(textFontSize);
  }

  setColors(colors: [string, string]) {
    this.options.colors = colors;
    this.marker?.setMarkersColors(colors);
  }

  setTextField(textField: string) {
    this.options.textField = textField;
    this.marker?.setMarkersTextField(textField);
  }

  setLayerId(layerId) {
    if (!this.features || JSON.stringify(this.features) === '{}') {
      return;
    }
    this.removed();
    this.layerId = layerId;
    this._createMarker();
  }

  private _initalizeMarkerLayer(fitBounds?: boolean) {
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
      !this.features?.features ||
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
        'circle-radius': 0,
        'circle-opacity': 1
      },
      metadata: {
        SM_Layer_Order: 'Top'
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
    let layer = this.map.getLayer(this.layerId) as unknown as mapboxglTypes.CircleLayer;
    if (layer && this.markers.length) {
      const opacity = this.map.getPaintProperty(this.layerId, 'circle-opacity');
      let updateOpacity = null;
      if (opacity !== +this.markers[0].getElement().style.opacity) {
        updateOpacity = opacity;
      }
      this.markers.forEach(marker => {
        if (updateOpacity !== null) {
          marker.getElement().style.opacity = updateOpacity;
        }
        marker &&
          (marker.getElement().style.display =
            this.map.getLayoutProperty(this.layerId, 'visibility') === 'visible'
              ? 'block'
              : 'none');
      });
    }
  }

  public removed() {
    if (this.map) {
      if (this.map.getLayer(this.layerId)) {
        this.map.removeLayer(this.layerId);
        this.map.removeSource(this.layerId);
      }
      this.map.off('styledata', this.updateLayerFn);
    }
    this.markers.length > 0 &&
      this.markers.forEach(marker => {
        marker?.remove();
      });
    this.markers = [];
  }

  _getPointFeatures(features: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
    const resultFeatures: GeoJSON.FeatureCollection<GeoJSON.Geometry>['features'] = [];
    features?.features?.forEach(feature => {
      const geometry = feature.geometry;
      if (geometry?.type === 'Point' && geometry.coordinates?.length !== 0) {
        resultFeatures.push(feature);
      }
    });
    return {
      type: 'FeatureCollection',
      features: resultFeatures
    };
  }

  private _getMarkerElement(features: GeoJSON.FeatureCollection): void {
    this.markersElement = [];
    this.marker = null;
    const { width, height, colors: colorsProp, textFontSize, textColor, textField } = this.options;
    const colors = <[string, string]>colorsProp;
    if (!features || JSON.stringify(features) === '{}' || !features.features) {
      this.removed();
      return;
    }
    if (features.features.length === 0) {
      this.removed();
      return;
    }
    switch (this.options.type as MarkerType) {
      case 'rotatingAperture':
        this.marker = new RotatingApertureMarker(features, {
          width,
          colors,
          textField,
          textColor,
          textFontSize
        });
        break;
      case 'haloRing':
        this.marker = new HaloRingMarker(features, {
          width,
          colors,
          textField,
          textColor,
          textFontSize
        });
        break;
      case 'breathingAperture':
        this.marker = new BreathingApertureMarker(features, {
          width,
          colors,
          textField,
          textColor,
          textFontSize
        });
        break;
      case 'diffusedAperture':
        this.marker = new DiffusedApertureMarker(features, {
          width,
          colors,
          textField,
          textColor,
          textFontSize
        });
        break;
      case 'rotatingTextBorder':
        this.marker = new RotatingTextBorderMarker(features, {
          width,
          height,
          colors,
          textField,
          textColor,
          textFontSize
        });
        break;
      case 'fluorescence':
        this.marker = new FluorescenceMarker(features, {
          width,
          colors,
          textField,
          textColor,
          textFontSize
        });
        break;
    }
    this.marker && (this.markersElement = this.marker.getMarkersElement());
  }
}
