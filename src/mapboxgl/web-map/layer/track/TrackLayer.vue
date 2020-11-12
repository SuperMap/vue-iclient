<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import MapGetter from '../../../_mixin/map-getter';
import VmUpdater from '../../../../common/_mixin/VmUpdater';
import TrackLayerViewModel, { layerStyleParams, positionTimeStampParams, directionParams } from './TrackLayerViewModel';
// eslint-disable-next-line
import { Feature } from 'geojson';

// @ts-ignore
@Component({
  name: 'SmTrackLayer',
  viewModelProps: [
    'loaderType',
    'url',
    'displayLine',
    'trackPoints',
    'position',
    'layerStyle',
    'direction',
    'unit',
    'scale',
    'fitBounds',
    'followCamera'
  ]
})
// @ts-ignore
class TrackLayer extends Mixins(MapGetter, VmUpdater) {
  viewModel: TrackLayerViewModel;

  @Prop() layerId: string;
  @Prop() loaderType: string;
  @Prop() url: string;
  @Prop() displayLine: string;
  @Prop() layerStyle: layerStyleParams;
  @Prop() trackPoints: Feature[];
  @Prop() position: positionTimeStampParams;
  @Prop() direction: directionParams;
  @Prop() unit: string;
  @Prop({ default: 1 }) scale: number;
  @Prop() fitBounds: boolean;
  @Prop() followCamera: boolean;

  created() {
    // @ts-ignore
    this.viewModel = new TrackLayerViewModel(this.$props);
  }

  reset() {
    // 重置初始位置
    this.viewModel && this.viewModel.reset();
  }

  render() {}
}

export default TrackLayer;
</script>
