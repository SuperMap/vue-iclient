<script lang="ts">
import 'vue-iclient/static/libs/iclient-mapboxgl/iclient-mapboxgl.min';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import GeojsonLayerViewModel from './GeojsonLayerViewModel';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/video-map-getter';
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator';

@Component({
  name: 'SmVideoMapGeojsonLayer'
})
class SmVideoMapGeojsonLayer extends Mixins(Layer, MapGetter) {
  viewModel: GeojsonLayerViewModel = null;
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
    this.viewModel = new GeojsonLayerViewModel(this.$props);
  }

  render() {
    return null;
  }
}
export default SmVideoMapGeojsonLayer;
</script>
