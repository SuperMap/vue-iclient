<script lang="ts">
import DrawViewModel, { MAP_DRAW_EVENTS } from './DrawViewModel';
import videoPlusGetter from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'SmVideoPlusDraw'
})
class SmVideoMapDraw extends Mixins(videoPlusGetter) {
  viewModel: DrawViewModel = null;

  @Prop({
    default: () => {
      return ['point', 'line_string', 'polygon', 'trash'];
    }
  }) controls: Array<string>;

  @Prop() modes: Object;

  @Prop({ default: 'top-left' }) position: Object;

  created() {
    // @ts-ignore
    this.viewModel = new DrawViewModel(this.$props);
    Object.keys(this.$listeners).forEach(eventName => {
      if (MAP_DRAW_EVENTS.includes(eventName)) {
        this.viewModel.on(eventName, this._bindMapEvent);
      }
    });
  }

  beforeDestroy() {
    this._clearEvents();
  }

  _bindMapEvent(e) {
    this.$emit(e.type, e);
  }

  _clearEvents() {
    MAP_DRAW_EVENTS.forEach(eventName => {
      this.viewModel.off(eventName, this._bindMapEvent);
    });
  }

  render() {
    return null;
  }
}
export default SmVideoMapDraw;
</script>
