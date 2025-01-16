import Vue from 'vue';
import { Component } from 'vue-property-decorator';

const LAYER_EVENTS_NAMES: string[] = [
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
  'mousemove',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'contextmenu',
  'touchstart',
  'touchend',
  'touchcancel'
];

@Component
export default class LayerEvents extends Vue {
  map: mapboxglTypes.Map;

  private layerEventCallback(event): void {
    this.emitLayerEvent(event.type, event);
  }

  bindLayerEvents(): void {
    Object.keys(this.$listeners).forEach(eventName => {
      if (LAYER_EVENTS_NAMES.includes(eventName)) {
        this.bindLayerEvent(eventName, this.layerEventCallback.bind(this));
      }
    });
  }

  private emitLayerEvent(name: string, event): void {
    this.$emit(name, {
      // @ts-ignore
      themeLayer: this.viewModel.themeLayer,
      map: this.map,
      ...event
    });
  }

  private bindLayerEvent(eventName: string, eventCallback) {
    // @ts-ignore
    this.viewModel.themeLayer.on(eventName, eventCallback);
  }
}
