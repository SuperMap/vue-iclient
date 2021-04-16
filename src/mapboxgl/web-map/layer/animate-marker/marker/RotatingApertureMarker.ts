import { FeatureCollection } from 'geojson';
import Marker from './Marker';

interface markerOptions {
  width?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}
export default class RotatingApertureMarker extends Marker {
  constructor(features: FeatureCollection, options: markerOptions = {}) {
    super(features, options);
    this.features && this._createMarker();
  }

  public setMarkersWidth(width: number): void {
    this.options.width = width;
    // TODO 待抛出 width 不能小于 40
    if (!this.options.width || this.options.width < 40) {
      return;
    }
    let dotsMarker = document.getElementsByClassName('sm-component-animate-marker--rotating-aperture');

    for (let i = 0; i < dotsMarker.length; i++) {
      // @ts-ignore
      dotsMarker[i].style.setProperty('--container-width', `${this.options.width}px`);
      let dots1 = dotsMarker[i].children[0];
      let dots2 = dotsMarker[i].children[1];
      let dots3 = dotsMarker[i].children[2];
      dots1.setAttribute('style', this._getDotsStyleObj(this.options.width - 32));
      dots2.setAttribute('style', this._getDotsStyleObj(this.options.width - 16));
      dots3.setAttribute('style', this._getDotsStyleObj(this.options.width));
    }
  }

  public setMarkersColors(colors: [string, string]): void {
    this.options.colors = colors;
    if (colors && colors.length && colors.length > 0) {
      let dotsMarker = document.getElementsByClassName('sm-component-animate-marker--rotating-aperture');
      for (let i = 0; i < dotsMarker.length; i++) {
        // @ts-ignore
        let style = dotsMarker[i].style;
        style.setProperty('--light-color', this.options.colors[1]);
        style.setProperty('--color', this.options.colors[0]);
        style.setProperty('--line-color', this._getColorWithOpacity(this.options.colors[0], 0.2));
      }
    }
  }

  _createMarker(): void {
    this.features.features.forEach(point => {
      let width = this.options.width && this.options.width >= 40 ? this.options.width : 50;
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--rotating-aperture';

      let childElements = this._createMakerElement(3, 'div', [
        'sm-component-animate-marker__dots',
        'sm-component-animate-marker__dots'
      ]);
      childElements.forEach((element, index) => {
        let elementWidth;
        index === 0 && (elementWidth = width - 32);
        index === 1 && (elementWidth = width - 16);
        index === 2 && (elementWidth = width);
        element.setAttribute('style', this._getDotsStyleObj(elementWidth));
        markerContainer.appendChild(element);
      });
      let nameContainer = this._getTextContainer(point, 'rotating-aperture-name');
      markerContainer.appendChild(nameContainer);
      if (
        this.options.colors &&
        this.options.colors.length &&
        this.options.colors.length > 0 &&
        this.options.colors[0].indexOf('rgb') > -1
      ) {
        markerContainer.style.setProperty('--color', this.options.colors[0]);
        markerContainer.style.setProperty('--line-color', this._getColorWithOpacity(this.options.colors[0], 0.2));
        markerContainer.style.setProperty('--light-color', this.options.colors[1]);
      }
      markerContainer.style.setProperty('--container-width', width + 'px');
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

  private _getDotsStyleObj(width): string {
    return `--dots-width: ${width}px;
      --dots-height: ${width}px;
      --dots-box-shadow-x: ${width / 2 + 6}px;
      --dots-box-shadow-x-negative: -${width / 2 + 6}px;
      --dots-box-shadow-radius1: ${width / 2 - 2}px;
      --dots-box-shadow-radius1-negative: -${width / 2 - 2}px;
      --dots-box-shadow-radius2: ${width / 2 - 3}px;
      --dots-box-shadow-radius2-negative: -${width / 2 - 3}px;`;
  }
}
