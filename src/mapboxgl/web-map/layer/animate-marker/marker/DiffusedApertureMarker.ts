import { FeatureCollection } from 'geojson';
import Marker from './Marker';

interface markerOptions {
  width?: number;
  colors?: [string, string];
  textField?: string;
  textColor?: string;
  textFontSize?: number;
}

export default class DiffusedApertureMarker extends Marker {
  constructor(features: FeatureCollection, options: markerOptions = {}) {
    super(features, options);
    this.features && this._createMarker();
  }

  public setMarkersWidth(width: number): void {
    this.options.width = width;
    let markerContainer = document.getElementsByClassName('sm-component-animate-marker--diffused-aperture');
    for (let i = 0; i < markerContainer.length; i++) {
      // @ts-ignore
      let style = markerContainer[i].style;
      style.setProperty('--container-width', width + 'px');
    }
  }

  public setMarkersColors(colors: [string, string]): void {
    this.options.colors = colors;
    if (colors && colors.length && colors.length > 0) {
      let markerContainer = document.getElementsByClassName('sm-component-animate-marker--diffused-aperture');
      for (let i = 0; i < markerContainer.length; i++) {
        // @ts-ignore
        let style = markerContainer[i].style;
        style.setProperty('--background-color', this.options.colors[0]);
        style.setProperty('--box-shadow-color', this.options.colors[1] || this.options.colors[0]);
      }
    }
  }

  _createMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--diffused-aperture';
      let wrapper = document.createElement('div');
      wrapper.className = 'sm-component-animate-marker__diffused-aperture-wrapper';
      let bg = document.createElement('div');
      bg.className = 'sm-component-animate-marker__bg';
      wrapper.appendChild(bg);
      let circle = document.createElement('div');
      circle.className = 'sm-component-animate-marker__circle';
      wrapper.appendChild(circle);
      markerContainer.appendChild(wrapper);
      let nameContainer = this._getTextContainer(point, 'diffused-aperture-name');
      markerContainer.appendChild(nameContainer);
      this.options.width && markerContainer.style.setProperty('--container-width', this.options.width + 'px');
      if (this.options.colors && this.options.colors.length && this.options.colors.length > 0) {
        markerContainer.style.setProperty('--background-color', this.options.colors[0]);
        markerContainer.style.setProperty('--box-shadow-color', this.options.colors[1] || this.options.colors[0]);
      }
      this.markersElement.push(markerContainer);
    }, this);
  }
}
