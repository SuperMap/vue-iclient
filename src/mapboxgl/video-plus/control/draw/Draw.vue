<script lang="ts">
import DrawViewModel from './DrawViewModel';
import videoPlusGetter from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop } from 'vue-property-decorator';

export const EVENTS = ['create', 'delete'];

@Component({
  name: 'SmVideoPlusDraw'
})
class SmVideoMapDraw extends Mixins(videoPlusGetter) {
  viewModel: DrawViewModel = null;
  videoPlus: any;
  @Prop({
    default: () => {
      return ['point', 'line_string', 'polygon', 'trash'];
    }
  })
  controls: Array<string>;

  @Prop() modes: Object;

  @Prop({ default: 'top-left' }) position: Object;

  created() {
    // @ts-ignore
    this.viewModel = new DrawViewModel(this.$props);
    this.viewModel.on('load', videoPlus => {
      this.videoPlus = videoPlus;
      EVENTS.forEach(eventName => {
        this.videoPlus.on(`draw.${eventName}`, this._bindEvent);
      });
    });
  }

  beforeDestroy() {
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        this.videoPlus && this.videoPlus.off(`draw.${eventName}`, this._bindEvent);
      }
    });
  }

  _bindEvent(e) {
    let type = e.type.split('.')[1];
    this.$emit(type, e);
  }

  render() {
    return null;
  }
}
export default SmVideoMapDraw;
</script>
