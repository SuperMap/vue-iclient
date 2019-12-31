import Vue from 'vue';
import { Component } from 'vue-property-decorator';

const MAP_EVENT_NAMES: string[] = [
  'resize',
  'webglcontextlost',
  'webglcontextrestored',
  'remove',
  'movestart',
  'contextmenu',
  'dblclick',
  'click',
  'touchcancel',
  'touchmove',
  'touchend',
  'touchstart',
  'dataloading',
  'mousemove',
  'mouseup',
  'mousedown',
  'sourcedataloading',
  'error',
  'data',
  'styledata',
  'sourcedata',
  'mouseout',
  'styledataloading',
  'moveend',
  'move',
  'render',
  'zoom',
  'zoomstart',
  'zoomend',
  'boxzoomstart',
  'boxzoomcancel',
  'boxzoomend',
  'rotate',
  'rotatestart',
  'rotateend',
  'dragend',
  'drag',
  'dragstart',
  'pitch',
  'idle'
];

@Component
export default class MapEvents extends Vue {
  map: mapboxglTypes.Map;

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
