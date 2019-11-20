import Vue from 'vue';
import { Component } from 'vue-property-decorator';

const MAP_EVENT_NAMES: string[] = [
  'zoomlevelschange',
  'resize',
  'unload',
  'viewreset',
  'load',
  'zoomstart',
  'movestart',
  'zoom',
  'move',
  'zoomend',
  'moveend',
  'popupopen',
  'popupclose',
  'autopanstart',
  'tooltipopen',
  'tooltipclose',
  'locationerror',
  'locationfound',
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseover',
  'mouseout',
  'mousemove',
  'contextmenu',
  'keypress',
  'keydown',
  'keyup',
  'preclick',
  'zoomanim'
];

@Component
export default class MapEvents extends Vue {
  map: L.Map;

  private mapEventCallback(event, data = {}): void {
    this.emitMapEvent(event.type, { mapboxEvent: event, ...data });
  }

  bindMapEvents(): void {
    Object.keys(this.$listeners).forEach(eventName => {
      if (MAP_EVENT_NAMES.includes(eventName)) {
        this.bindMapEvent(eventName, this.mapEventCallback.bind(this));
      }
    });
  }

  private emitMapEvent(name: string, data = {}): void {
    this.$emit(name, {
      map: this.map,
      component: this,
      ...data
    });
  }

  private bindMapEvent(eventName: string, eventCallback) {
    this.map.on(eventName, eventCallback);
  }
}
