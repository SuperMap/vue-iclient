import { FeatureCollection } from 'geojson';
import Marker from './Marker';

interface markerOptions {
  width?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}

export default class BreathingApertureMarker extends Marker {
  constructor(features: FeatureCollection, options: markerOptions = {}) {
    super(features, options);
    this.features && this._createMarker();
  }

  public setMarkersWidth(width: number): void {
    this.options.width = width;
    let pulse = document.getElementsByClassName('sm-component-animate-marker__pulse');
    for (let i = 0; i < pulse.length; i++) {
      // @ts-ignore
      this._setBreathingApertureWidth(pulse[i].style);
    }
  }

  public setMarkersColors(colors: [string, string]): void {
    this.options.colors = colors;
    if (colors && colors.length && colors.length > 0) {
      let dot = document.getElementsByClassName('sm-component-animate-marker__dot-point');
      for (let i = 0; i < dot.length; i++) {
        // @ts-ignore
        dot[i].style.background = this.options.colors[0];
      }
      let pulse = document.getElementsByClassName('sm-component-animate-marker__pulse');
      for (let i = 0; i < pulse.length; i++) {
        // @ts-ignore
        let style = pulse[i].style;
        style.borderColor = this.options.colors[0];
        style.boxShadow = `0 0 12px ${this.options.colors[1]}, 0 0 20px ${this.options.colors[1]} inset`;
      }
    }
  }

  _createMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--breathing-aperture';
      let dot = document.createElement('span');
      dot.className = 'sm-component-animate-marker__dot-point';
      let colors;
      if (this.options.colors && this.options.colors.length && this.options.colors.length > 0) {
        colors = this.options.colors;
      }
      colors && (dot.style.background = colors[0]);
      markerContainer.appendChild(dot);
      let childElements = this._createMakerElement(3, 'span', [
        'sm-component-animate-marker__delay',
        'sm-component-animate-marker__pulse'
      ]);
      childElements.forEach(element => {
        if (colors) {
          element.style.borderColor = colors[0];
          element.style.boxShadow = `0 0 12px ${colors[1]}, 0 0 20px ${colors[1]} inset`;
        }
        this._setBreathingApertureWidth(element.style);
        markerContainer.appendChild(element);
      });
      let nameContainer = this._getTextContainer(point, 'breathing-aperture-name');
      markerContainer.appendChild(nameContainer);
      this.markersElement.push(markerContainer);
    }, this);
  }

  private _setBreathingApertureWidth(style): void {
    let { width } = this.options;
    if (width) {
      style.width = width + 'px';
      style.height = width + 'px';
      style.top = -width / 2 + 'px';
      style.left = -width / 2 + 'px';
      style.borderRadius = width / 2 + 'px';
    }
  }

  private _createMakerElement(length: number, type: string, classNames: Array<string>): HTMLElement[] {
    let markerElements = [];
    for (let i = 1; i < length + 1; i++) {
      let element = document.createElement(type);
      element.className = `${classNames[0]}-0${i} ${classNames[1]}`;
      markerElements.push(element);
    }
    return markerElements;
  }
}
