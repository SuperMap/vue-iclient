<script lang="ts">
import PopupViewModel from './PopupViewModel';
import VideoPlusGetters from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop, InjectReactive, Watch } from 'vue-property-decorator';

const EVENTS = ['open', 'close'];
@Component({
  name: 'SmVideoPlusPopup'
})
class SmVideoPlusPopup extends Mixins(VideoPlusGetters) {
  viewModel: PopupViewModel = null;
  initial: boolean = false;
  @InjectReactive() marker: Object;
  @Prop() coordinate: Array<number>;
  @Prop() content: string | Object;
  @Prop() maxWidth: string;
  @Prop() className: string
  @Prop({ default: true }) show: boolean;
  @Prop({ default: true }) closeButton: boolean;
  @Prop({ default: true }) closeOnClick: boolean;
  @Prop({
    default: () => {
      return [0, 0];
    }
  })
  offset: number | Object | Array<number>;

  get open() {
    if (this.viewModel !== undefined) {
      return this.viewModel.isOpen();
    }
    return false;
  }

  set open(value) {
    // @ts-ignore
    if (this.videoPlus && this.viewModel) {
      if (!value) {
        // @ts-ignore
        this.viewModel.remove();
      } else {
        this.viewModel.addToMap();
      }
    }
  }

  @Watch('coordinate')
  coordinateChanged(coordinate) {
    if (!this.initial) return;
    this.viewModel.setCoordinate(coordinate);
  }

  @Watch('show')
  showChanged(next, prev) {
    if (next !== prev) {
      this.open = next;
      if (this.marker) {
        // @ts-ignore
        this.marker.togglePopup();
      }
    }
  }

  mounted() {
    // @ts-ignore
    this.viewModel = new PopupViewModel(this.$props);
    this._bindEvents();
    this.initial = true;
  }

  _bindEvents() {
    this.viewModel.on('load', (videoPlus) => {
      this.videoPlus = videoPlus;
      if (this.coordinate !== undefined) {
        this.viewModel.setCoordinate(this.coordinate);
      }
      if (this.$slots.default !== undefined) {
        this.viewModel.setDOMContent(this.$slots.default[0].elm || this.content);
      }
      if (this.marker) {
        this.viewModel.setPopup(this.marker);
      }
      if (this.show) {
        this.open = true;
        if (this.marker) {
          // @ts-ignore
          this.marker.togglePopup();
        }
      }
    });
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        this.viewModel.on(eventName, this._emitEvent);
      }
    });
  }

  _emitEvent(e) {
    this.$emit(e.type, e);
  }

  remove() {
    // @ts-ignore
    this.viewModel.removed();
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        this.viewModel.off(eventName, this._emitEvent);
      }
    });
  }

  render(h) {
    return h('template', [this.$slots.default]);
  }
}
export default SmVideoPlusPopup;
</script>
