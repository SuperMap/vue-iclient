<script lang="ts">
import PopupViewModel from './PopupViewModel';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/video-map-getter';
import { Mixins, Component, Prop, InjectReactive, Watch } from 'vue-property-decorator';

const EVENTS = ['open', 'close'];
@Component({
  name: 'SmVideoPopup'
})
class SmVideoPopup extends Mixins(MapGetter) {
  viewModel: PopupViewModel = null;
  initial: boolean = false;
  @InjectReactive() marker: Object;
  @Prop() coordinate: Array<number>;
  @Prop() maxWidth: string;
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
    if (this.webmapVm.videoMap && this.viewModel) {
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
    this.addPopup();
    this.initial = true;
  }

  addPopup() {
    // @ts-ignore
    this.viewModel = new PopupViewModel(this.$props);
    this._bindEvents();
  }

  _bindEvents() {
    this.viewModel.on('load', () => {
      if (this.coordinate !== undefined) {
        this.viewModel.setCoordinate(this.coordinate);
      }
      if (this.$slots.default !== undefined) {
        this.viewModel.setDOMContent(this.$slots.default[0].elm);
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
    this.viewModel.remove();
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
export default SmVideoPopup;
</script>
