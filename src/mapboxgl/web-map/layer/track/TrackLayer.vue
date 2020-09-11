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
    'scale',
    'fitBounds'
  ]
})
// @ts-ignore
class TrackLayer extends Mixins(MapGetter, VmUpdater) {
  viewModel: TrackLayerViewModel;

  @Prop() layerId: string;
  @Prop() loaderType: string;
  @Prop() loaderUrl: string;
  @Prop() imgUrl: string;
  @Prop() displayLine: string;
  @Prop() layerStyle: layerStyleParams;
  @Prop() geoJSON: FeatureCollection;
  @Prop() positionTimestamp: positionTimeStampParams;
  @Prop() direction: directionParams;
  @Prop() unit: string;
  @Prop() scale: number;
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
