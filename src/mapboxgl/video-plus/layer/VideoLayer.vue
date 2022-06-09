<script lang="ts">
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import VideoLayerViewModel from './VideoLayerViewModel';
import VideoPlusGetters from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'SmVideoPlusLayer'
})
class SmVideoPlusLayer extends Mixins(Layer, VideoPlusGetters) {
  viewModel: VideoLayerViewModel = null;
  @Prop() data: Object;
  @Prop() layerStyle: Object;

  @Watch('layerStyle')
  layerStyleChanged() {
    this.viewModel && this.viewModel.setLayerStyle(this.layerStyle);
  }

  @Watch('data')
  dataChanged() {
    this.viewModel && this.viewModel.setData(this.data);
  }

  created() {
    // @ts-ignore
    this.viewModel = new VideoLayerViewModel(this.$props);
  }

  render() {
    return null;
  }
}
export default SmVideoPlusLayer;
</script>
