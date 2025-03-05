import type { Map, MapLayerEventType } from 'mapbox-gl';
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

export const LAYER_EVENT_NAMES = [
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
] as const;

export type MapEventName = (typeof MAP_EVENT_NAMES)[number];

export type LayerEventName = (typeof LAYER_EVENT_NAMES)[number];

export type MapEventHandler = {
  map: Map;
  mapboxEvent: { type: string; [key: string]: any };
  layerId?: string;
  [key: string]: any;
}

export default class MapEvents extends Events {
  map: Map;
  layerId: string;
  _customListenerNames: string[];
  _listenerNames: string[] = [];

  triggerEvent: (name: string, ...rest: any) => any;
  on: (data: Record<string, (...rest: any) => void>) => void;
  un: (data: Record<string, (...rest: any) => void>) => void;
  eventTypes: string[];
  mapEventCallbackFn: (ev: any) => void;

  constructor(customListenerNames: string[]) {
    super();
    this._customListenerNames = customListenerNames;
    this.eventTypes = MAP_EVENT_NAMES as unknown as string[];
    this.mapEventCallbackFn = this.mapEventCallback.bind(this);
  }

  bindMapEvents(map: Map, layerId?: string): void {
    this.map = map;
    this.layerId = layerId;
    const builtInEvents = (layerId ? MAP_EVENT_NAMES : LAYER_EVENT_NAMES) as unknown as string[];
    this._customListenerNames.forEach((eventName) => {
      if (builtInEvents.includes(eventName)) {
        this._listenerNames.push(eventName);
        this.bindMapEvent(eventName, this.mapEventCallbackFn);
      }
    });
  }

  unbindMapEvents() {
    if (this.map) {
      this._customListenerNames.forEach((eventName) => {
        if (this._listenerNames.includes(eventName)) {
          this.unbindMapEvent(eventName, this.mapEventCallbackFn);
        }
      });
    }
  }

  private mapEventCallback(
    event: MapEventHandler['mapboxEvent'],
    data = {}
  ): void {
    const mapParams: MapEventHandler = {
      map: this.map,
      mapboxEvent: event,
      ...data
    };
    if (this.layerId) {
      mapParams.layerId = this.layerId;
    }
    this.triggerEvent(event.type, {
      mapParams 
    });
  }

  private bindMapEvent(eventName: string, eventCallback: (ev: any) => void) {
    if (this.layerId) {
      this.map.on<keyof MapLayerEventType>(eventName as keyof MapLayerEventType, this.layerId, eventCallback);
      return;
    }
    this.map.on(eventName, eventCallback);
  }

  private unbindMapEvent(eventName: string, eventCallback: (ev: any) => void) {
    if (this.layerId) {
      this.map.off<keyof MapLayerEventType>(eventName as keyof MapLayerEventType, this.layerId, eventCallback);
      return;
    }
    this.map.off(eventName, eventCallback);
  }
}
