import { FeatureCollection, Feature } from 'geojson';
import { getColorWithOpacity } from '../../../../../common/_utils/util';
interface markerOptions {
  width?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}
export default abstract class Marker {
  features: FeatureCollection;

  markersElement: HTMLElement[] = [];

  options: markerOptions;

  constructor(features: FeatureCollection, options: markerOptions = {}) {
    this.features = features;
    this.options = options;
  }

  public setFeatures(features: FeatureCollection): void {
    this.markersElement = [];
    this.features = features;
    this.features && this._createMarker();
  }

  public getMarkersElement(): HTMLElement[] {
    return this.markersElement;
  }

  public setMarkersTextField(textField: string): void {
    if (!this.features || JSON.stringify(this.features) === '{}') {
      return;
    }
    this.options.textField = textField;
    let name = document.getElementsByClassName('sm-component-animate-marker__name');

    for (let i = 0; i < name.length; i++) {
      let properties = this.features.features[i] && this.features.features[i].properties;
      if (properties && properties[textField]) {
        name[i].innerHTML = properties[textField];
      } else {
        name[i].innerHTML = '';
      }
    }
  }

  public setMarkersTextFontSize(textFontSize: number): void {
    this.options.textFontSize = textFontSize;
    let pulse = document.getElementsByClassName('sm-component-animate-marker__name-container');
    for (let i = 0; i < pulse.length; i++) {
      // @ts-ignore
      pulse[i].style.fontSize = textFontSize + 'px';
    }
  }

  public setMarkersTextColor(textColor: string): void {
    this.options.textColor = textColor;
    let pulse = document.getElementsByClassName('sm-component-animate-marker__name-container');
    for (let i = 0; i < pulse.length; i++) {
      // @ts-ignore
      pulse[i].style.color = textColor;
    }
  }

  abstract _createMarker(): void;

  protected _getColorWithOpacity(color: string, opacity: number | string): string {
    return getColorWithOpacity(color, opacity);
  }

  protected _getTextContainer(point: Feature, className: string): HTMLElement {
    let name;
    if (point.properties && Object.keys(point.properties).length !== 0 && this.options.textField) {
      name = point.properties[this.options.textField];
    }
    let nameContainer = document.createElement('div');
    nameContainer.className = `sm-component-animate-marker__name-container sm-component-animate-marker__name-container--${className}`;
    this.options.textColor && (nameContainer.style.color = this.options.textColor);
    this.options.textFontSize && (nameContainer.style.fontSize = this.options.textFontSize + 'px');
    let nameSpan = document.createElement('span');
    nameSpan.className = `sm-component-animate-marker__${className} sm-component-animate-marker__name`;
    nameSpan.innerHTML = name || '';
    nameContainer.appendChild(nameSpan);
    return nameContainer;
  }
}
