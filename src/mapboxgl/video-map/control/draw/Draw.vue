<script lang="ts">
import DrawViewModel from './DrawViewModel';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/video-map-getter';
import { Mixins, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'SmVideoMapDraw'
})
class SmVideoMapDraw extends Mixins(MapGetter) {
  viewModel: DrawViewModel = null;
  @Prop({
    default: () => {
      return {};
    }
  }) options: Object;

  @Prop({ default: 'top-left' }) position: Object;

  created() {
    // @ts-ignore
    this.viewModel = new DrawViewModel(this.options, this.position);
  }

  render() {
    return null;
  }
}
export default SmVideoMapDraw;
</script>
