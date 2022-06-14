<script lang="ts">
import VideoLayerViewModel from './VideoLayerViewModel';
import VideoPlusGetters from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator';
import UniqueId from 'lodash.uniqueid';
import clonedeep from 'lodash.clonedeep';

const EVENTS = [
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'contextmenu'
];

@Component({
  name: 'SmVideoPlusLayer'
})
class SmVideoPlusLayer extends Mixins(VideoPlusGetters) {
  viewModel: VideoLayerViewModel = null;
  videoPlus: any;
  @Prop({
    default() {
      return UniqueId(`${this.$options.name.toLowerCase()}-`);
    }
  })
  layerId: string;

  @Prop() data: Object;
  @Prop() layerStyle: Object;
  @Prop() layout;
  @Prop() paint;

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
    if (this.layout) {
      this.$watch('layout', function (next) {
        if (next) {
          for (let prop of Object.keys(next)) {
            this.viewModel.setLayoutProperty(this.layerId, prop, next[prop]);
          }
        }
      });
    }

    if (this.paint) {
      this.$watch('paint', function (next) {
        if (next) {
          for (let prop of Object.keys(next)) {
            this.viewModel.setPaintProperty(this.layerId, prop, next[prop]);
          }
        }
      });
    }

    this.viewModel.on('load', videoPlus => {
      this.videoPlus = videoPlus;
      Object.keys(this.$listeners).forEach(eventName => {
        if (EVENTS.includes(eventName)) {
          this.videoPlus.on(eventName, this._bindEvent);
        }
      });
    });
  }

  _bindEvent(e): void {
    if (e.isLayer && e.event && e.event.features && e.event.features[0] && e.event.features[0].layer.id === this.layerId) {
      this.$emit(e.type, clonedeep(e.event));
    }
  }

  beforeDestroy() {
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        this.videoPlus && this.videoPlus.off(eventName, this._bindEvent);
      }
    });
  }

  render() {
    return null;
  }
}
export default SmVideoPlusLayer;
</script>
