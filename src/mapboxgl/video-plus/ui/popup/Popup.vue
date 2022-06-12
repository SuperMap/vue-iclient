<script lang="ts">
import PopupViewModel from './PopupViewModel';
import VideoPlusGetters from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop, Watch } from 'vue-property-decorator';

const EVENTS = ['open', 'close'];

@Component({
  name: 'SmVideoPlusPopup'
})
class SmVideoPlusPopup extends Mixins(VideoPlusGetters) {
  viewModel: PopupViewModel = null;
  initial: boolean = false;
  videoPlus: any;
  @Prop() coordinate: Array<number>;
  @Prop() content: string;
  @Prop({ default: '240px' }) maxWidth: string;
  @Prop() className: string;
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
      // @ts-ignore
      if (this.marker) {
        // @ts-ignore
        this.marker.togglePopup();
      }
    }
  }

  @Watch('content')
  contentChanged() {
    this.viewModel.setDOMContent(this.content);
  }

  mounted() {
    // @ts-ignore
    if (this.$parent && this.$parent.viewModel && this.$parent.viewModel.marker) {
      // @ts-ignore
      this.marker = this.$parent.viewModel.marker;
    }
    // @ts-ignore
    this.viewModel = new PopupViewModel(this.$props);
    this._bindEvents();
    this.initial = true;
  }

  _bindEvents() {
    this.viewModel.on('load', () => {
      if (this.coordinate !== undefined) {
        this.viewModel.setCoordinate(this.coordinate);
      }
      // @ts-ignore
      if (this.$slots.default !== undefined) {
        // @ts-ignore
        this.viewModel.setDOMContent(this.$slots.default[0].elm);
      } else {
        this.viewModel.setText(this.content);
      }
      // @ts-ignore
      if (this.marker) {
        // @ts-ignore
        this.viewModel.setPopup(this.marker);
      }
      if (this.show) {
        this.open = true;
        // @ts-ignore
        if (this.marker) {
          // @ts-ignore
          this.marker.togglePopup();
        }
      }
    });
    // @ts-ignore
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        this.viewModel.on(eventName, this._emitEvent);
      }
    });
  }

  _emitEvent(e) {
    // @ts-ignore
    this.$emit(e.type, e);
  }

  destroyed() {
    // @ts-ignore
    Object.keys(this.$listeners).forEach(eventName => {
      if (EVENTS.includes(eventName)) {
        this.viewModel.off(eventName, this._emitEvent);
      }
    });
  }

  render(h) {
    // @ts-ignore
    return h('template', [this.$slots.default]);
  }
}
export default SmVideoPlusPopup;
</script>
