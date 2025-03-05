<script lang="ts">
import type { FeatureCollection } from 'geojson';
import type { AnimateMarkerLayerOptions } from 'vue-iclient-core/controllers/mapboxgl/AnimateMarkerLayerViewModel';
import { Component, Mixins, Prop } from 'vue-property-decorator';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import AnimateMarkerLayerViewModel from 'vue-iclient-core/controllers/mapboxgl/AnimateMarkerLayerViewModel';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';

/**
 * @module AnimateMarkerLayer
 */
@Component({
  name: 'SmAnimateMarkerLayer',
  viewModelProps: ['features', 'type', 'width', 'height', 'textColor', 'textFontSize', 'colors', 'textField']
})
class AnimateMarkerLayer extends Mixins(MapGetter, Layer, VmUpdater) {
  viewModel: AnimateMarkerLayerViewModel;

  @Prop() features: FeatureCollection;

  @Prop({ default: 'breathingAperture' }) type: any;

  @Prop() width: number;

  @Prop() height: number;

  @Prop() colors: [string, string];

  @Prop({ default: 14 }) textFontSize: number;

  @Prop() textColor: string;

  @Prop() textField: string;

  @Prop({ default: true }) fitBounds: boolean;

  created() {
    this.viewModel = new AnimateMarkerLayerViewModel({ ...this.$props } as unknown as AnimateMarkerLayerOptions);
  }

  render(): void {}
}

export default AnimateMarkerLayer;
</script>
