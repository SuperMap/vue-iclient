<script lang='ts'>
import { Component, Mixins, Prop } from 'vue-property-decorator';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';
import FireLayerViewModel from './FireLayerViewModel';
// eslint-disable-next-line
import { FeatureCollection } from 'geojson';
/**
 * @module FireLayer
 */
// @ts-ignore   TODO mixins 待重写
@Component({
  name: 'SmFireLayer',
  viewModelProps: ['features', 'modelScale']
})

// @ts-ignore
class FireLayer extends Mixins(MapGetter, Layer, VmUpdater) {
  viewModel: FireLayerViewModel;
  // eslint-disable-next-line
  map: mapboxglTypes.Map;

  // @ts-ignore
  @Prop() features: FeatureCollection;

  // @ts-ignore
  @Prop({ default: 5.41843220338983e-6 }) modelScale: number;

  created() {
    // @ts-ignore
    this.viewModel = new FireLayerViewModel(this.features, this.modelScale, this.layerId);
  }

  render(): void {}
}

export default FireLayer;
</script>
