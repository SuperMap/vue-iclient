<script lang="ts">
import MarkerViewModel from './MarkerViewModel';
import VideoPlusGetters from 'vue-iclient/src/mapboxgl/_mixin/video-plus-getters';
import { Mixins, Component, Prop, ProvideReactive, Watch } from 'vue-property-decorator';

const markerEvents = {
  drag: 'drag',
  dragstart: 'dragstart',
  dragend: 'dragend'
};

@Component({
  name: 'SmVideoMarker'
})
class SmVideoMarker extends Mixins(VideoPlusGetters) {
  viewModel: MarkerViewModel = null;
  initial: boolean = false;
  @ProvideReactive() get marker() {
    if (this.viewModel) {
      return this.viewModel.marker;
    }
    return null;
  }

  @Prop({
    default: () => {
      return [0, 0];
    }
  })
  offset: Object | Array<number> | number;

  @Prop() coordinate: Array<number>;
  @Prop() color: string;
  @Prop({ default: 'center' }) anchor: boolean;
  @Prop({ default: false }) draggable: boolean;

  mounted() {
    this.addMarker();
    this._bindEvents();
    this.initial = true;
  }

  @Watch('coordinate')
  coordinateChanged(coordinate) {
    if (!this.initial) return;
    this.viewModel.setCoordinate(coordinate);
  }

  @Watch('draggable')
  draggableChanged(next) {
    if (!this.initial) return;
    this.viewModel.setDraggable(next);
  }

  addMarker() {
    const markerOptions = {
      ...this.$props
    };
    if (this.$slots.marker) {
      markerOptions.element = this.$slots.marker[0].elm;
    }
    // @ts-ignore
    this.viewModel = new MarkerViewModel(markerOptions);
  }

  _bindEvents() {
    this.viewModel.on('load', () => {
      this.viewModel.setCoordinate(this.coordinate).addToMap();
    });
    const eventNames = Object.keys(markerEvents);
    Object.keys(this.$listeners).forEach(eventName => {
      if (eventNames.includes(eventName)) {
        this.viewModel.on(eventName, this._emitEvent);
      }
    });
  }

  _emitEvent(e) {
    this.$emit(e.type, e);
  }

  _unbindEvents(events) {
    if (events.length === 0) return;
    events.forEach(eventName => {
      this.viewModel.off(eventName, this._emitEvent);
    });
  }

  destroyed() {
    const eventNames = Object.keys(markerEvents);
    this._unbindEvents(eventNames);
  }

  togglePopup() {
    return this.viewModel.togglePopup();
  }

  render(h) {
    return h('template', [this.$slots.marker, this.initial ? this.$slots.default : null]);
  }
}
export default SmVideoMarker;
</script>
