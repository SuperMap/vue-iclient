<script lang='ts'>
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import MapGetter from '../../../_mixin/map-getter';
import AnimateMarkerLayerViewModel from './AnimateMarkerLayerViewModel';
// eslint-disable-next-line
import { FeatureCollection } from 'geojson';

/**
 * @module AnimateMarkerLayer
 */
// @ts-ignore   TODO mixins 待重写
@Component({
  name: 'SmAnimateMarkerLayer',
  loaded: vm => {
    vm.features && vm._getMarkerElement();
    vm.viewModel = new AnimateMarkerLayerViewModel(vm.map, vm.features, vm._markersElement);
  }
})

// @ts-ignore
class AnimateMarkerLayer extends Mixins(MapGetter) {
  viewModel: AnimateMarkerLayerViewModel;
  // eslint-disable-next-line
  map: mapboxglTypes.Map;

  _markersElement: HTMLElement[];

  // @ts-ignore
  @Prop() features: FeatureCollection;
  // @ts-ignore TODO type 类型
  @Prop({ default: 'breathingAperture' }) type: any;
  // @ts-ignore
  @Prop() width: number;
  // @ts-ignore
  @Prop() height: number;
  // @ts-ignore
  @Prop() colors: [string, string];
  // @ts-ignore
  @Prop({ default: 14 }) textFontSize: number;
  // @ts-ignore
  @Prop() textColor: string;
  // @ts-ignore
  @Prop() textField: string;

  // @ts-ignore
  @Watch('features')
  featuresChanged() {
    if (this.viewModel) {
      this._markersElement = [];
      this._getMarkerElement();
      this.viewModel.setFeatures(this.features, this._markersElement);
    }
  }

  // @ts-ignore
  @Watch('type')
  typeChanged() {
    if (this.viewModel) {
      this._markersElement = [];
      this._getMarkerElement();
      this.viewModel.setType(this._markersElement);
    }
  }

  // @ts-ignore
  @Watch('width')
  widthChanged() {
    if (this.viewModel && this.width) {
      switch (this.type) {
        case 'rotatingAperture':
          this._setRotatingApertureStyle('width');
          break;
        case 'haloRing':
          this._setHaloRingStyle('width');
          break;
        case 'breathingAperture':
          this._setBreathingApertureStyle('width');
          break;
        case 'diffusedAperture':
          this._setDiffuseApertureStyle('width');
          break;
        case 'rotatingTextBorder':
          this._setRotatingTextBoderStyle('width');
          break;
      }
    }
  }

  // @ts-ignore
  @Watch('height')
  heightChanged() {
    if (this.viewModel && this.height) {
      if (this.type === 'rotatingTextBorder') {
        this._setRotatingTextBoderStyle('height');
      }
    }
  }

  // @ts-ignore
  @Watch('textColor')
  textColorChanged() {
    if (this.viewModel && this.textColor) {
      if (this.type === 'breathingAperture') {
        let pulse = document.getElementsByClassName('sm-component-animate-marker__name-container');
        for (let i = 0; i < pulse.length; i++) {
          // @ts-ignore
          pulse[i].style.color = this.textColor;
        }
      } else if (this.type === 'rotatingTextBorder') {
        this._setRotatingTextBoderStyle('textColor');
      }
    }
  }

  // @ts-ignore
  @Watch('textFontSize')
  textFontSizeChanged() {
    if (this.viewModel && this.textFontSize) {
      if (this.type === 'breathingAperture') {
        let pulse = document.getElementsByClassName('sm-component-animate-marker__name-container');
        for (let i = 0; i < pulse.length; i++) {
          // @ts-ignore
          pulse[i].style.fontSize = this.textFontSize + 'px';
        }
      } else if (this.type === 'rotatingTextBorder') {
        this._setRotatingTextBoderStyle('textFontSize');
      }
    }
  }

  // @ts-ignore
  @Watch('colors')
  colorsChanged() {
    if (this.viewModel && this.colors && this.colors.length && this.colors.length > 0) {
      switch (this.type) {
        case 'rotatingAperture':
          this._setRotatingApertureStyle('colors');
          break;
        case 'haloRing':
          this._setHaloRingStyle('colors');
          break;
        case 'breathingAperture':
          this._setBreathingApertureStyle('colors');
          break;
        case 'diffusedAperture':
          this._setDiffuseApertureStyle('colors');
          break;
        case 'rotatingTextBorder':
          this._setRotatingTextBoderStyle('colors');
          break;
      }
    }
  }

  // @ts-ignore
  @Watch('textField')
  textFieldChanged() {
    if (this.textField) {
      switch (this.type) {
        case 'breathingAperture':
          this._setBreathingApertureStyle('textField');
          break;
        case 'rotatingTextBorder':
          this._setRotatingTextBoderStyle('textField');
          break;
      }
    }
  }

  mounted() {
    this._markersElement = [];
  }
  /* methods */
  _getMarkerElement(): void {
    switch (this.type) {
      case 'rotatingAperture':
        this._createRotatingApertureMarker();
        break;
      case 'haloRing':
        this._createHaloRingMarker();
        break;
      case 'breathingAperture':
        this._createBreathingApertureMarker();
        break;
      case 'diffusedAperture':
        this._createDiffusedApertureMarker();
        break;
      case 'rotatingTextBorder':
        this._createRotatingTextBorderMarker();
        break;
    }
  }
  _createBreathingApertureMarker(): void {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--breathing-aperture';
      let dot = document.createElement('span');
      dot.className = 'sm-component-animate-marker__dot-point';
      markerContainer.appendChild(dot);
      let childElements = this._createMakerElement(3, 'span', [
        'sm-component-animate-marker__delay',
        'sm-component-animate-marker__pulse'
      ]);
      childElements.forEach(element => {
        if (this.colors && this.colors.length && this.colors.length > 0) {
          element.style.borderColor = this.colors[0];
          element.style.boxShadow = `0 0 12px ${this.colors[1]}, 0 0 20px ${this.colors[1]} inset`;
        }
        this._setBreathingApertureWidth(element.style);
        markerContainer.appendChild(element);
      });
      let name;
      if (point.properties && Object.keys(point.properties).length !== 0 && this.textField) {
        name = point.properties[this.textField];
      }
      let nameContainer = document.createElement('div');
      nameContainer.className = 'sm-component-animate-marker__name-container';
      nameContainer.style.color = this.textColor;
      nameContainer.style.fontSize = this.textFontSize + 'px';
      let nameSpan = document.createElement('span');
      nameSpan.className = 'sm-component-animate-marker__breathing-aperture-name';
      nameSpan.innerHTML = name || '';
      nameContainer.appendChild(nameSpan);
      markerContainer.appendChild(nameContainer);
      this._markersElement.push(markerContainer);
    });
  }
  _createRotatingApertureMarker() {
    this.features.features.forEach(point => {
      let step: any = this._getRotatingApertureWidthStep();
      let width = step ? this.width : 50;
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--rotating-aperture';

      let childElements = this._createMakerElement(3, 'div', [
        'sm-component-animate-marker__dots',
        'sm-component-animate-marker__dots'
      ]);
      childElements.forEach((element, index) => {
        let elementWidth;
        index === 0 && (elementWidth = width - ((step && step * 2) || 16));
        index === 1 && (elementWidth = width - (step || 32));
        index === 2 && (elementWidth = width);
        element.setAttribute('style', this._getDotsStyleObj(elementWidth));
        markerContainer.appendChild(element);
      });
      if (this.colors && this.colors.length && this.colors.length > 0 && this.colors[0].indexOf('rgb') > -1) {
        markerContainer.style.setProperty('--color', this.colors[0]);
        markerContainer.style.setProperty('--line-color', this._getRgbaColor(this.colors[0], 0.2));
        markerContainer.style.setProperty('--light-color', this.colors[1]);
      }
      markerContainer.style.setProperty('--container-width', width + 'px');
      this._markersElement.push(markerContainer);
    }, this);
  }
  _createHaloRingMarker() {
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
      if (this.width) {
        markerContainer.style.setProperty('--halo-width', this.width + 'px');
        markerContainer.style.setProperty('--halo-left', -this.width / 2 + 'px');
        markerContainer.style.setProperty('--box-shadow-width-1', this.width / 10 + 'px');
        markerContainer.style.setProperty('--box-shadow-width-2', this.width / 4 + 'px');
      }
      if (this.colors && this.colors.length && this.colors.length > 0 && this.colors[0].indexOf('rgb') > -1) {
        markerContainer.style.setProperty('--color-1', this._getRgbaColor(this.colors[0], 0.3));
        markerContainer.style.setProperty('--color-1-transparent', this._getRgbaColor(this.colors[0], 0.1));
        markerContainer.style.setProperty('--color-2', this._getRgbaColor(this.colors[1], 0.3));
        markerContainer.style.setProperty('--color-2-transparent', this._getRgbaColor(this.colors[1], 0.1));
      }
      this._markersElement.push(markerContainer);
    }, this);
  }
  _createRotatingTextBorderMarker() {
    this.features.features.forEach(point => {
      let markerContainer = document.createElement('div');
      markerContainer.className = 'sm-component-animate-marker--text-boder';
      let border = document.createElement('div');
      border.className = 'sm-component-animate-marker__boder';

      let keys = Object.keys(point.properties);
      let name;
      if (point.properties || Object.keys(point.properties).length !== 0) {
        name = point.properties[this.textField] || point.properties[keys[0]];
      }
      let span = document.createElement('span');
      span.className = 'sm-component-animate-marker__text';
      span.innerHTML = name || '';
      border.appendChild(span);
      if (this.colors && this.colors.length && this.colors.length > 0) {
        markerContainer.style.setProperty('--border-color', this.colors[0]);
        markerContainer.style.setProperty('--box-shadow-color', this.colors[1]);
      }
      this.textColor && markerContainer.style.setProperty('--text-color', this.textColor);
      markerContainer.style.setProperty('--text-font-size', this.textFontSize + 'px');
      if (this.width) {
        markerContainer.style.setProperty('--clip-width-1', this.width + this.width / 10 + 'px');
        markerContainer.style.setProperty('--clip-width-2', this.width + this.width / 10 - 2 + 'px');
        markerContainer.style.setProperty('--boder-width', this.width + 'px');
        markerContainer.style.setProperty('--text-left-position', -this.width / 2 + 'px');
      }
      if (this.height) {
        markerContainer.style.setProperty('--clip-height-1', this.height + this.width / 10 + 'px');
        markerContainer.style.setProperty('--clip-height-2', this.height + this.width / 10 - 2 + 'px');
        markerContainer.style.setProperty('--boder-height', this.height + 'px');
      }
      if ((this.height || 100) > (this.width || 200)) {
        markerContainer.style.setProperty('--animation-name', 'clipMe2');
      } else {
        markerContainer.style.setProperty('--animation-name', 'clipMe1');
      }
      markerContainer.appendChild(border);
      this._markersElement.push(markerContainer);
    }, this);
  }
  _createDiffusedApertureMarker() {
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
      this.width && markerContainer.style.setProperty('--container-width', this.width + 'px');
      if (this.colors && this.colors.length && this.colors.length > 0) {
        markerContainer.style.setProperty('--background-color', this.colors[0]);
        markerContainer.style.setProperty('--box-shadow-color', this.colors[1] || this.colors[0]);
      }
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
    if (type === 'colors') {
      let dot = document.getElementsByClassName('sm-component-animate-marker__dot-point');
      for (let i = 0; i < dot.length; i++) {
        // @ts-ignore
        dot[i].style.background = this.colors[0];
      }
      let pulse = document.getElementsByClassName('sm-component-animate-marker__pulse');
      for (let i = 0; i < pulse.length; i++) {
        // @ts-ignore
        let style = pulse[i].style;
        style.borderColor = this.colors[0];
        style.boxShadow = `0 0 12px ${this.colors[1]}, 0 0 20px ${this.colors[1]} inset`;
      }
    } else if (type === 'width') {
      let pulse = document.getElementsByClassName('sm-component-animate-marker__pulse');
      for (let i = 0; i < pulse.length; i++) {
        // @ts-ignore
        this._setBreathingApertureWidth(pulse[i].style);
      }
    } else if (type === 'textField') {
      let name = document.getElementsByClassName('sm-component-animate-marker__breathing-aperture-name');
      for (let i = 0; i < name.length; i++) {
        name[i].innerHTML = this.features.features[i].properties[this.textField];
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
    if (type === 'colors') {
      if (!(this.colors[0].indexOf('rgb') > -1)) {
        return;
      }
      let dotsMarker = document.getElementsByClassName('sm-component-animate-marker--rotating-aperture');
      for (let i = 0; i < dotsMarker.length; i++) {
        // @ts-ignore
        let style = dotsMarker[i].style;
        style.setProperty('--light-color', this.colors[1]);
        style.setProperty('--color', this.colors[0]);
        style.setProperty('--line-color', this._getRgbaColor(this.colors[0], 0.2));
      }
    } else if (type === 'width') {
      let step = this._getRotatingApertureWidthStep();
      // TODO 待抛出 width 不能小于 26
      if (!step) {
        return;
      }
      let dotsMarker = document.getElementsByClassName('sm-component-animate-marker--rotating-aperture');

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

  _setHaloRingStyle(type) {
    let markerContainer = document.getElementsByClassName('sm-component-animate-marker--halo-ring');
    for (let i = 0; i < markerContainer.length; i++) {
      // @ts-ignore
      let style = markerContainer[i].style;
      if (type === 'colors' && this.colors[0].indexOf('rgb') > -1) {
        style.setProperty('--color-1', this._getRgbaColor(this.colors[0], 0.3));
        style.setProperty('--color-1-transparent', this._getRgbaColor(this.colors[0], 0.1));
        style.setProperty('--color-2', this._getRgbaColor(this.colors[1], 0.3));
        style.setProperty('--color-2-transparent', this._getRgbaColor(this.colors[1], 0.1));
      }
      if (type === 'width') {
        style.setProperty('--halo-width', this.width + 'px');
        style.setProperty('--halo-left', -this.width / 2 + 'px');
        style.setProperty('--box-shadow-width-1', this.width / 10 + 'px');
        style.setProperty('--box-shadow-width-2', this.width / 4 + 'px');
      }
    }
  }

  _setRotatingTextBoderStyle(type) {
    if (type !== 'textField') {
      let markerContainer = document.getElementsByClassName('sm-component-animate-marker--text-boder');
      for (let i = 0; i < markerContainer.length; i++) {
        // @ts-ignore
        let style = markerContainer[i].style;
        if (type === 'width') {
          style.setProperty('--clip-width-1', this.width + this.width / 10 + 'px');
          style.setProperty('--clip-width-2', this.width + this.width / 10 - 2 + 'px');
          style.setProperty('--boder-width', this.width + 'px');
          style.setProperty('--text-left-position', -this.width / 2 + 'px');
        }
        if (type === 'height') {
          style.setProperty('--clip-height-1', this.height + this.height / 10 + 'px');
          style.setProperty('--boder-height', this.height + 'px');
        }
        if (type === 'colors') {
          style.setProperty('--border-color', this.colors[0]);
          style.setProperty('--box-shadow-color', this.colors[1]);
        }
        if (type === 'textColor') {
          style.setProperty('--text-color', this.textColor);
        }
        if (type === 'textFontSize') {
          style.setProperty('--text-font-size', this.textFontSize + 'px');
        }
        if ((this.height || 100) > (this.width || 200)) {
          style.setProperty('--animation-name', 'clipMe2');
        } else {
          style.setProperty('--animation-name', 'clipMe1');
        }
      }
    } else {
      let name = document.getElementsByClassName('sm-component-animate-marker__text');
      for (let i = 0; i < name.length; i++) {
        name[i].innerHTML = this.features.features[i].properties[this.textField];
      }
    }
  }

  _setDiffuseApertureStyle(type) {
    let markerContainer = document.getElementsByClassName('sm-component-animate-marker--diffused-aperture');
    for (let i = 0; i < markerContainer.length; i++) {
      // @ts-ignore
      let style = markerContainer[i].style;
      if (type === 'width') {
        style.setProperty('--container-width', this.width + 'px');
      }
      if (type === 'colors') {
        style.setProperty('--background-color', this.colors[0]);
        style.setProperty('--box-shadow-color', this.colors[1] || this.colors[0]);
      }
    }
  }

  _createMakerElement(length: number, type: string, classNames: Array<string>) {
    let markerElements = [];
    for (let i = 1; i < length + 1; i++) {
      let element = document.createElement(type);
      element.className = `${classNames[0]}-0${i} ${classNames[1]}`;
      markerElements.push(element);
    }
    return markerElements;
  }

  _getRotatingApertureWidthStep() {
    let step = 16;
    if (!this.width || this.width < 26) {
      return false;
    }
    if (this.width < 48) {
      step = 8;
    }
    return step;
  }

  _getRgbaColor(color, opacity) {
    if (!(color.indexOf('rgb') > -1)) {
      return null;
    } else {
      // TODO 待优化
      let colors = color
        .split('(')[1]
        .split(')')[0]
        .split(',');
      let rgbaColor = `rgba(${colors[0]},${colors[1]},${colors[2]},${opacity})`;
      return rgbaColor;
    }
  }
  render(): void {}
}

export default AnimateMarkerLayer;
</script>
