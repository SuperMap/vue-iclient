<script lang='ts'>
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import MapGetter from '../../../_mixin/map-getter';
import Layer from '../../../_mixin/layer';
import DynamicMarkerLayerViewModel from './DynamicMarkerLayerViewModel';
// eslint-disable-next-line
import { FeatureCollection } from 'geojson';

/**
 * @module DynamicMarkerLayer
 */
// @ts-ignore   TODO mixins 待重写
@Component({
  name: 'SmDynamicMarkerLayer',
  loaded: vm => {
    vm._getMarkerElement();
    vm.viewModel = new DynamicMarkerLayerViewModel(vm.map, vm.features, vm._markersElement, vm.type, null, vm.layerId);
  }
})

// @ts-ignore
class DynamicMarkerLayer extends Mixins(MapGetter, Layer) {
  viewModel: DynamicMarkerLayerViewModel;
  // eslint-disable-next-line
  map: mapboxglTypes.Map;

  _markersElement: HTMLElement[];

  layerId: string;

  // @ts-ignore
  @Prop() features: FeatureCollection;
  // @ts-ignore TODO type 类型
  @Prop({ default: 'breathingAperture' }) type: any;
  // @ts-ignore
  @Prop({ default: 88 }) width: number;
  // @ts-ignore
  @Prop({ default: '#009fd9' }) color: string;
  // @ts-ignore
  @Prop({ default: '#009fd9' }) lightColor: string;
  // @ts-ignore
  @Prop({ default: 14 }) textFontSize: number;
  // @ts-ignore
  @Prop({ default: '#ccc' }) textColor: string;

  // @ts-ignore
  @Watch('type')
  typeChanged() {
    if (this.viewModel) {
      this._getMarkerElement();
      this.viewModel.setType(this.type, this._markersElement);
    }
  }

  // @ts-ignore
  @Watch('width')
  widthChanged() {
    if (this.viewModel) {
      if (this.type === 'breathingAperture') {
        this._setBreathingApertureStyle('width');
      } else if (this.type === 'rotatingAperture') {
        this._setRotatingApertureStyle('width');
      }
    }
  }

  // @ts-ignore
  @Watch('lightColor')
  lightColorChanged() {
    if (this.viewModel) {
      if (this.type === 'breathingAperture') {
      } else if (this.type === 'rotatingAperture') {
        let dotsMarker = document.getElementsByClassName('sm-component-dynamic-marker--rotating-aperture');
        for (let i = 0; i < dotsMarker.length; i++) {
          // @ts-ignore
          dotsMarker[i].style.setProperty('--light-color', this.lightColor);
        }
      }
    }
  }

  // @ts-ignore
  @Watch('color')
  colorChanged() {
    if (this.viewModel) {
      if (this.type === 'breathingAperture') {
        this._setBreathingApertureStyle('color');
      } else if (this.type === 'rotatingAperture') {
        this._setRotatingApertureStyle('color');
      }
    }
  }

  // @ts-ignore
  @Watch('textColor')
  textColorChanged() {
    if (this.viewModel) {
      if (this.type === 'breathingAperture') {
        let pulse = document.getElementsByClassName('sm-component-dynamic-marker__name-container');
        for (let i = 0; i < pulse.length; i++) {
          // @ts-ignore
          pulse[i].style.color = this.textColor;
        }
      }
    }
  }

  mounted() {
    this._markersElement = [];
  }
  /* methods */
  _getMarkerElement(): void {
    if (this.type === 'breathingAperture') {
      this._createBreathingApertureMarker();
    } else if (this.type === 'rotatingAperture') {
      this._createRotatingApertureMarker();
    }
  }
  _createBreathingApertureMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-dynamic-marker --breathing-aperture';
      let delay3 = document.createElement('span');
      delay3.className = 'sm-component-dynamic-marker__delay-03 sm-component-dynamic-marker__pulse';
      delay3.style.borderColor = this.color;
      delay3.style.boxShadow = `0 0 12px ${this.color}, 0 0 20px ${this.color} inset`;
      this._setBreathingApertureWidth(delay3.style);
      markerContainer.appendChild(delay3);
      let delay2 = document.createElement('span');
      delay2.className = 'sm-component-dynamic-marker__delay-02 sm-component-dynamic-marker__pulse';
      delay2.style.borderColor = this.color;
      delay2.style.boxShadow = `0 0 12px ${this.color}, 0 0 20px ${this.color} inset`;
      this._setBreathingApertureWidth(delay2.style);
      markerContainer.appendChild(delay2);
      let delay1 = document.createElement('span');
      delay1.className = 'sm-component-dynamic-marker__delay-01 sm-component-dynamic-marker__pulse';
      delay1.style.borderColor = this.color;
      delay1.style.boxShadow = `0 0 12px ${this.color}, 0 0 20px ${this.color} inset`;
      this._setBreathingApertureWidth(delay1.style);
      markerContainer.appendChild(delay1);
      let name = point.properties && (point.properties['name'] || point.properties['Name'] || point.properties['NAME']);
      if (name) {
        let nameContainer = document.createElement('div');
        nameContainer.className = 'sm-component-dynamic-marker__name-container';
        nameContainer.style.color = this.textColor;
        let nameSpan = document.createElement('span');
        nameSpan.innerHTML = name;
        nameContainer.appendChild(nameSpan);
        markerContainer.appendChild(nameContainer);
      }
      this._markersElement.push(markerContainer);
    });
  }
  _createRotatingApertureMarker() {
    this.features.features.forEach(point => {
      let step = this._getRotatingApertureWidthStep();
      let width = step ? this.width : 50;
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-dynamic-marker--rotating-aperture';
      let dots1 = document.createElement('div');
      dots1.className = 'sm-component-dynamic-marker__dots-01 sm-component-dynamic-marker__dots';
      dots1.setAttribute('style', this._getDotsStyleObj(width - ((step && step * 2) || 16)));
      markerContainer.appendChild(dots1);
      let dots2 = document.createElement('div');
      dots2.className = 'sm-component-dynamic-marker__dots-02 sm-component-dynamic-marker__dots';
      dots2.setAttribute('style', this._getDotsStyleObj(width - (step || 32)));
      markerContainer.appendChild(dots2);
      let dots3 = document.createElement('div');
      dots3.className = 'sm-component-dynamic-marker__dots-03 sm-component-dynamic-marker__dots';
      dots3.setAttribute('style', this._getDotsStyleObj(width));
      markerContainer.appendChild(dots3);
      markerContainer.style.setProperty('--container-width', '100px');
      markerContainer.style.setProperty('--color', this.color);
      markerContainer.style.setProperty('--line-color', this._getRgbaColor(this.color));
      markerContainer.style.setProperty('--light-color', this.lightColor);
      this._markersElement.push(markerContainer);
    }, this);
  }

  _getDotsStyleObj(width) {
    return `--dots-width: ${width}px;
      --dots-height: ${width}px;
      --dots-box-shadow-x: ${width / 2 + 6}px;
      --dots-box-shadow-x-negative: -${width / 2 + 6}px;
      --dots-box-shadow-radius1: ${width / 2 - 2}px;
      --dots-box-shadow-radius1-negative: -${width / 2 - 2}px;
      --dots-box-shadow-radius2: ${width / 2 - 3}px;
      --dots-box-shadow-radius2-negative: -${width / 2 - 3}px;`;
  }
  _setBreathingApertureStyle(type) {
    if (type === 'color') {
      // TODO setCircleStyle
      this.map.setPaintProperty(this.layerId, 'circle-color', this.color);
      this.map.setPaintProperty(this.layerId, 'circle-stroke-color', this.color);
      let pulse = document.getElementsByClassName('sm-component-dynamic-marker__pulse');
      for (let i = 0; i < pulse.length; i++) {
        // @ts-ignore
        let style = pulse[i].style;
        style.borderColor = this.color;
        style.boxShadow = `0 0 12px ${this.color}, 0 0 20px ${this.color} inset`;
      }
    } else if (type === 'width') {
      let pulse = document.getElementsByClassName('sm-component-dynamic-marker__pulse');
      for (let i = 0; i < pulse.length; i++) {
        // @ts-ignore
        this._setBreathingApertureWidth(pulse[i].style);
      }
    }
  }

  _setBreathingApertureWidth(style) {
    style.width = this.width + 'px';
    style.height = this.width + 'px';
    style.top = -this.width / 2 + 'px';
    style.left = -this.width / 2 + 5 + 'px';
    style.borderRadius = this.width / 2 + 'px';
  }

  _setRotatingApertureStyle(type) {
    if (type === 'color') {
      if (!(this.color.indexOf('rgb') > -1)) {
        return;
      }
      let rgbaColor = this._getRgbaColor(this.color);
      let dotsMarker = document.getElementsByClassName('sm-component-dynamic-marker--rotating-aperture');

      for (let i = 0; i < dotsMarker.length; i++) {
        // @ts-ignore
        let style = dotsMarker[i].style;
        style.setProperty('--color', this.color);
        style.setProperty('--line-color', rgbaColor);
      }
    } else if (type === 'width') {
      let step = this._getRotatingApertureWidthStep();
      // TODO 待抛出 width 不能小于 26
      if (!step) {
        return;
      }
      let dotsMarker = document.getElementsByClassName('sm-component-dynamic-marker--rotating-aperture');

      for (let i = 0; i < dotsMarker.length; i++) {
        // @ts-ignore
        dotsMarker[i].style.setProperty('--container-width', `${this.width}px`);
        let dots1 = dotsMarker[i].children[0];
        let dots2 = dotsMarker[i].children[1];
        let dots3 = dotsMarker[i].children[2];
        dots1.setAttribute('style', this._getDotsStyleObj(this.width - step * 2));
        dots2.setAttribute('style', this._getDotsStyleObj(this.width - step));
        dots3.setAttribute('style', this._getDotsStyleObj(this.width));
      }
    }
  }

  _getRotatingApertureWidthStep() {
    let step = 16;
    if (this.width < 48) {
      step = 8;
    } else if (this.width < 26) {
      return false;
    }
    return step;
  }

  _getRgbaColor(color) {
    if (!(color.indexOf('rgb') > -1)) {
      return null;
    } else {
      // TODO 待优化
      let colors = color
        .split('(')[1]
        .split(')')[0]
        .split(',');
      let rgbaColor = `rgba(${colors[0]},${colors[1]},${colors[2]},0.2)`;
      return rgbaColor;
    }
  }
  render(): void {}
}

export default DynamicMarkerLayer;
</script>
