import { FeatureCollection } from 'geojson';
import Marker from './Marker';

interface markerOptions {
  width?: number;
  height?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}

export default class RotatingTextBorderMarker extends Marker {
  options: markerOptions;

  constructor(features: FeatureCollection, options: markerOptions = {}) {
    super(features);
    this.options = options;
    this.features && this._createMarker();
  }

  public setMarkersWidth(width) {
    this.options.width = width;
    this._setMarkerContainerProperty({
      '--clip-width-1': width + width / 10 + 'px',
      '--clip-width-2': width + width / 10 - 2 + 'px',
      '--boder-width': width + 'px',
      '--text-left-position': -width / 2 + 'px'
    });
  }

  public setMarkersHeight(height) {
    this.options.height = height;
    this._setMarkerContainerProperty({
      '--clip-height-1': height + height / 10 + 'px',
      '--clip-height-2': height + height / 10 - 2 + 'px',
      '--boder-height': height + 'px'
    });
  }

  public setMarkersTextField(textField) {
    this.options.textField = textField;
    let name = document.getElementsByClassName('sm-component-animate-marker__text');
    for (let i = 0; i < name.length; i++) {
      name[i].innerHTML = this.features.features[i].properties[textField];
    }
  }

  public setMarkersTextColor(textColor) {
    this.options.textColor = textColor;
    this._setMarkerContainerProperty({
      '--text-color': textColor
    });
  }

  public setMarkersTextFontSize(textFontSize) {
    this.options.textFontSize = textFontSize;
    this._setMarkerContainerProperty({
      '--text-font-size': textFontSize + 'px'
    });
  }

  public setMarkersColors(colors) {
    this.options.colors = colors;
    if (colors && colors.length && colors.length > 0) {
      this._setMarkerContainerProperty({
        '--border-color': colors[0],
        '--box-shadow-color': colors[1]
      });
    }
  }
  _createMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--text-boder';
      let border = document.createElement('div');
      border.className = 'sm-component-animate-marker__boder';

      let keys = Object.keys(point.properties);
      let name;
      if (point.properties || Object.keys(point.properties).length !== 0) {
        name = point.properties[this.options.textField] || point.properties[keys[0]];
      }
      let span = document.createElement('span');
      span.className = 'sm-component-animate-marker__text';
      span.innerHTML = name || '';
      border.appendChild(span);
      if (this.options.colors && this.options.colors.length && this.options.colors.length > 0) {
        markerContainer.style.setProperty('--border-color', this.options.colors[0]);
        markerContainer.style.setProperty('--box-shadow-color', this.options.colors[1]);
      }
      this.options.textColor && markerContainer.style.setProperty('--text-color', this.options.textColor);
      this.options.textFontSize &&
        markerContainer.style.setProperty('--text-font-size', this.options.textFontSize + 'px');
      if (this.options.width) {
        markerContainer.style.setProperty('--clip-width-1', this.options.width + this.options.width / 10 + 'px');
        markerContainer.style.setProperty('--clip-width-2', this.options.width + this.options.width / 10 - 2 + 'px');
        markerContainer.style.setProperty('--boder-width', this.options.width + 'px');
        markerContainer.style.setProperty('--text-left-position', -this.options.width / 2 + 'px');
      }
      if (this.options.height) {
        markerContainer.style.setProperty('--clip-height-1', this.options.height + this.options.width / 10 + 'px');
        markerContainer.style.setProperty('--clip-height-2', this.options.height + this.options.width / 10 - 2 + 'px');
        markerContainer.style.setProperty('--boder-height', this.options.height + 'px');
      }
      if ((this.options.width || 100) > (this.options.width || 200)) {
        markerContainer.style.setProperty('--animation-name', 'clipMe2');
      } else {
        markerContainer.style.setProperty('--animation-name', 'clipMe1');
      }
      markerContainer.appendChild(border);
      this.markersElement.push(markerContainer);
    }, this);
  }

  private _setMarkerContainerProperty(properties) {
    let markerContainer = document.getElementsByClassName('sm-component-animate-marker--text-boder');
    for (let i = 0; i < markerContainer.length; i++) {
      // @ts-ignore
      let style = markerContainer[i].style;
      Object.keys(properties).forEach(key => {
        style.setProperty(key, properties[key]);
      });
      if ((this.options.height || 100) > (this.options.width || 200)) {
        style.setProperty('--animation-name', 'clipMe2');
      } else {
        style.setProperty('--animation-name', 'clipMe1');
      }
    }
  }
}
