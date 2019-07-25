<script lang='ts'>
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import MapGetter from '../../../_mixin/map-getter';
import AnimateMarkerLayerViewModel from './AnimateMarkerLayerViewModel';
import BreathingApertureMarker from './marker/BreathingApertureMarker';
import DiffusedApertureMarker from './marker/DiffusedApertureMarker';
import HaloRingMarker from './marker/HaloRingMarker';
import RotatingApertureMarker from './marker/RotatingApertureMarker';
import RotatingTextBorderMarker from './marker/RotatingTextBorderMarker';

// eslint-disable-next-line
import { FeatureCollection } from 'geojson';

/**
 * @module AnimateMarkerLayer
 */
@Component({
  name: 'SmAnimateMarkerLayer',
  loaded: vm => {
    vm.features && vm._getMarkerElement();
    vm.viewModel = new AnimateMarkerLayerViewModel(vm.map, vm.features, vm._markersElement);
  }
})
class AnimateMarkerLayer extends Mixins(MapGetter) {
  viewModel: AnimateMarkerLayerViewModel;
  // eslint-disable-next-line
  map: mapboxglTypes.Map;

  marker: any;
  // 进行类型断言时报错 先注释掉 待优化
  // | RotatingTextBorderMarker
  // | BreathingApertureMarker
  // | DiffusedApertureMarker
  // | HaloRingMarker
  // | RotatingApertureMarker;

  _markersElement: HTMLElement[];

  @Prop() features: FeatureCollection;

  @Prop({ default: 'breathingAperture' }) type: any;

  @Prop() width: number;

  @Prop() height: number;

  @Prop() colors: [string, string];

  @Prop({ default: 14 }) textFontSize: number;

  @Prop() textColor: string;

  @Prop() textField: string;

  @Watch('features')
  featuresChanged() {
    if (this.viewModel) {
      this._markersElement = [];
      this._getMarkerElement();
      this.viewModel.setFeatures(this.features, this._markersElement);
    }
  }

  @Watch('type')
  typeChanged() {
    if (this.viewModel) {
      this._markersElement = [];
      this._getMarkerElement();
      this.viewModel.setType(this._markersElement);
    }
  }

  @Watch('width')
  widthChanged() {
    if (this.viewModel && this.width) {
      this.marker && this.marker.setMarkersWidth(this.width);
    }
  }

  @Watch('height')
  heightChanged() {
    if (this.viewModel && this.height) {
      this.marker && this.marker.setMarkersHeight && this.marker.setMarkersHeight(this.height);
    }
  }

  @Watch('textColor')
  textColorChanged() {
    if (this.viewModel && this.textColor) {
      this.marker && this.marker.setMarkersTextColor(this.textColor);
    }
  }

  @Watch('textFontSize')
  textFontSizeChanged() {
    if (this.viewModel && this.textFontSize) {
      this.marker && this.marker.setMarkersTextFontSize(this.textFontSize);
    }
  }

  @Watch('colors')
  colorsChanged() {
    if (this.viewModel && this.colors && this.colors.length && this.colors.length > 0) {
      this.marker && this.marker.setMarkersColors(this.colors);
    }
  }

  @Watch('textField')
  textFieldChanged() {
    if (this.textField) {
      this.marker && this.marker.setMarkersTextField(this.textField);
    }
  }

  mounted() {
    this._markersElement = [];
  }
  /* methods */
  _getMarkerElement(): void {
    this.marker = null;
    let { features, width, height, colors, textFontSize, textColor, textField } = this;
    switch (this.type) {
      case 'rotatingAperture':
        this.marker = new RotatingApertureMarker(features, { width, colors, textField, textColor, textFontSize });
        break;
      case 'haloRing':
        this.marker = new HaloRingMarker(features, { width, colors, textField, textColor, textFontSize });
        break;
      case 'breathingAperture':
        this.marker = new BreathingApertureMarker(features, { width, colors, textField, textColor, textFontSize });
        break;
      case 'diffusedAperture':
        this.marker = new DiffusedApertureMarker(features, { width, colors, textField, textColor, textFontSize });
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
    }
    this.marker && (this._markersElement = this.marker.getMarkersElement());
  }
  render(): void {}
}

export default AnimateMarkerLayer;
</script>
