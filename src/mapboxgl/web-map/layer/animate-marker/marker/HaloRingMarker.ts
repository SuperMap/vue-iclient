import { FeatureCollection } from 'geojson';
import colorcolor from 'colorcolor';
import Marker from './Marker';

interface markerOptions {
  width?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}
export default class HaloRingMarker extends Marker {
  constructor(features: FeatureCollection, options: markerOptions = {}) {
    super(features, options);
    this.features && this._createMarker();
  }

  public setMarkersWidth(width: number): void {
    this.options.width = width;
    let markerContainer = document.getElementsByClassName('sm-component-animate-marker--halo-ring');
    for (let i = 0; i < markerContainer.length; i++) {
      // @ts-ignore
      let style = markerContainer[i].style;
      style.setProperty('--halo-width', this.options.width + 'px');
      style.setProperty('--halo-left', -this.options.width / 2 + 'px');
      style.setProperty('--box-shadow-width-1', this.options.width / 10 + 'px');
      style.setProperty('--box-shadow-width-2', this.options.width / 4 + 'px');
    }
  }

  public setMarkersColors(colors: [string, string]): void {
    this.options.colors = colors;
    if (colors && colors.length && colors.length > 0) {
      let markerContainer = document.getElementsByClassName('sm-component-animate-marker--halo-ring');
      for (let i = 0; i < markerContainer.length; i++) {
        // @ts-ignore
        let style = markerContainer[i].style;
        style.setProperty('--color-1', this._getColorWithOpacity(this.options.colors[0], 0.3));
        style.setProperty('--color-1-transparent', this._getColorWithOpacity(this.options.colors[0], 0.1));
        style.setProperty('--color-2', this._getColorWithOpacity(this.options.colors[1], 0.3));
        style.setProperty('--color-2-transparent', this._getColorWithOpacity(this.options.colors[1], 0.1));
      }
    }
  }

  _createMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--halo-ring';
      let childElements = this._createMakerElement(8, 'div', [
        'sm-component-animate-marker__ring',
        'sm-component-animate-marker__halo'
      ]);
      childElements.forEach(element => {
        markerContainer.appendChild(element);
      });
      let nameContainer = this._getTextContainer(point, 'halo-ring-name');
      markerContainer.appendChild(nameContainer);
      if (this.options.width) {
        markerContainer.style.setProperty('--halo-width', this.options.width + 'px');
        markerContainer.style.setProperty('--halo-left', -this.options.width / 2 + 'px');
        markerContainer.style.setProperty('--box-shadow-width-1', this.options.width / 10 + 'px');
        markerContainer.style.setProperty('--box-shadow-width-2', this.options.width / 4 + 'px');
      }
      if (this.options.colors && this.options.colors.length && this.options.colors.length > 0) {
        markerContainer.style.setProperty(
          '--color-1',
          this._getColorWithOpacity(colorcolor(this.options.colors[0], 'rgba', true), 0.3)
        );
        markerContainer.style.setProperty(
          '--color-1-transparent',
          this._getColorWithOpacity(colorcolor(this.options.colors[0], 'rgba', true), 0.1)
        );
        markerContainer.style.setProperty(
          '--color-2',
          this._getColorWithOpacity(colorcolor(this.options.colors[1], 'rgba', true), 0.3)
        );
        markerContainer.style.setProperty(
          '--color-2-transparent',
          this._getColorWithOpacity(colorcolor(this.options.colors[1], 'rgba', true), 0.1)
        );
      }
      this.markersElement.push(markerContainer);
    }, this);
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
