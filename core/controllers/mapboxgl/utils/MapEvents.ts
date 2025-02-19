import type { Map } from 'mapbox-gl';
import { Events } from 'vue-iclient-core/types/event/Events';

export const MAP_EVENT_NAMES = [
  'resize',
  'webglcontextlost',
  'webglcontextrestored',
  'remove',
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
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'sourcedataloading',
  'error',
  'data',
  'styledata',
  'sourcedata',
  'styledataloading',
  'styleimagemissing',
  'movestart',
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
  'pitchend',
  'pitchstart',
  'idle',
  'wheel'
] as const;

export type MapEventName = (typeof MAP_EVENT_NAMES)[number];

export default class MapEvents extends Events {
  map: Map;
  builtInEvents: string[];
  listeners: Record<string, (...params: any) => void>;

  triggerEvent: (name: string, ...rest: any) => any;
  on: (data: Record<string, (...rest: any) => void>) => void;
  un: (data: Record<string, (...rest: any) => void>) => void;

  constructor(listeners: Record<string, any>) {
    super();
    this.listeners = listeners;
    this.builtInEvents = MAP_EVENT_NAMES as unknown as string[];
    this.eventTypes = this.builtInEvents;
  }

  bindMapEvents(map: Map): void {
    this.map = map;
    Object.keys(this.listeners).forEach((eventName) => {
      if (this.builtInEvents.includes(eventName)) {
        this.bindMapEvent(eventName, this.mapEventCallback.bind(this));
      }
    });
  }

  private mapEventCallback(
    event: { type: string; [key: string]: any },
    data = {}
  ): void {
    this.triggerEvent(event.type, {
      mapParams: {
        map: this.map,
        component: this,
        mapboxEvent: event,
        ...data
      }
    });
  }

  private bindMapEvent(
    eventName: string,
    eventCallback: typeof this.mapEventCallback
  ) {
    this.map.on(eventName, eventCallback);
  }
}
