<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import MapGetter from '../../../_mixin/map-getter';
import VmUpdater from '../../../../common/_mixin/vm-updater';
import TrackLayerViewModel, { layerStyleParams, positionTimeStampParams, directionParams } from './TrackLayerViewModel';
// eslint-disable-next-line
import { FeatureCollection } from 'geojson';

// @ts-ignore
@Component({
  name: 'SmTrackLayer',
  viewModelProps: [
    'loaderType',
    'loaderUrl',
    'imgUrl',
    'displayLine',
    'geoJSON',
    'positionTimestamp',
    'layerStyle',
    'direction',
    'unit',
    'scale'
  ]
})
// @ts-ignore
class TrackLayer extends Mixins(MapGetter, VmUpdater) {
  viewModel: TrackLayerViewModel;

  // @ts-ignore
  @Prop() layerId: string;
  // @ts-ignore
  @Prop() loaderType: string;
  // @ts-ignore
  @Prop() loaderUrl: string;
  // @ts-ignore
  @Prop() imgUrl: string;
  // @ts-ignore
  @Prop() displayLine: string;
  // @ts-ignore
  @Prop() layerStyle: layerStyleParams;
  // @ts-ignore
  @Prop() geoJSON: FeatureCollection;
  // @ts-ignore
  @Prop() positionTimestamp: positionTimeStampParams;
  // @ts-ignore
  @Prop() direction: directionParams;
  // @ts-ignore
  @Prop() unit: string;
  // @ts-ignore
  @Prop() scale: number;

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
