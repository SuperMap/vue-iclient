import { FeatureCollection } from 'geojson';
import Marker from './Marker';

interface markerOptions {
  width?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}

export default class FluorescenceMarker extends Marker {
  constructor(features: FeatureCollection, options: markerOptions = {}) {
    super(features, options);
    this.features && this._createMarker();
  }

  public setMarkersWidth(width: number): void {
    this.options.width = width;
    let markerContainer = document.getElementsByClassName('sm-component-animate-marker--fluorescence');
    for (let i = 0; i < markerContainer.length; i++) {
      // @ts-ignore
      this._setFluorescenceWidth(markerContainer[i].style);
    }
  }

  public setMarkersColors(colors: [string, string]): void {
    this.options.colors = colors;
    if (colors && colors.length && colors.length > 0) {
      let markerContainer = document.getElementsByClassName('sm-component-animate-marker--fluorescence');
      for (let i = 0; i < markerContainer.length; i++) {
        // @ts-ignore
        this._setFluorescenceColor(markerContainer[i].style);
      }
    }
  }

  _createMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--fluorescence';
      let marker = document.createElement('div');
      marker.className = 'sm-component-animate-marker__fluorescence';
      markerContainer.appendChild(marker);
      let nameContainer = this._getTextContainer(point, 'fluorescence-name');
      markerContainer.appendChild(nameContainer);
      this._setFluorescenceWidth(markerContainer.style);
      this._setFluorescenceColor(markerContainer.style);
      this.markersElement.push(markerContainer);
    });
  }

  _setFluorescenceWidth(style): void {
    if (this.options.width) {
      style.setProperty('--container-width', this.options.width / 3 + 'px');
      style.setProperty('--box-shadow-width', this.options.width + 'px');
    }
  }
  _setFluorescenceColor(style): void {
    if (this.options.colors && this.options.colors.length > 0) {
      style.setProperty('--box-shadow-color', this.options.colors[0]);
      style.setProperty('--light-color', this.options.colors[1]);
    }
  }
}
