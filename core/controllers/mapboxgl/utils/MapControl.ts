import type { Map, IControl } from 'mapbox-gl';
import { Events } from 'vue-iclient-core/types/event/Events';
import mapEvent from 'vue-iclient-core/types/map-event';

export type ControlPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface MapControlProps {
  el: HTMLElement
  position: ControlPosition;
  mapTarget: string;
  parentTarget?: string;
}

export default class MapControl extends Events {
  map: Record<string, any>;
  mapTarget: string;
  firstDefaultTarget: string;
  control: IControl;
  position: ControlPosition;
  private _el: HTMLElement;
  private _parentTarget: string;

  triggerEvent: (name: string, ...rest: any) => any;
  on: (data: Record<string, (...rest: any) => void>) => void;
  un: (data: Record<string, (...rest: any) => void>) => void;
  eventTypes: string[];

  constructor(options: MapControlProps) {
    super();
    this.eventTypes = ['hook:loaded', 'hook:removed'];
    this.position = options.position;
    this.mapTarget = options.mapTarget;
    this._el = options.el;
    this._parentTarget = options.parentTarget;
    this.controlLoadMapSucceed = this.controlLoadMapSucceed.bind(this);
  }

  get firstTarget(): string {
    let targetName: string;
    const mapList = mapEvent.getAllMaps();
    for (let target in mapList) {
      if (target) {
        targetName = target;
        break;
      }
    }
    return targetName;
  }

  get targetName() {
    return this.mapTarget || this._parentTarget || this.firstTarget;
  }

  get _isControl() {
    return Boolean(this._el && this._parentTarget);
  }

  onMounted() {
    if (this._isControl) {
      const targetName = this.targetName;
      if (mapEvent.getMap(targetName)) {
        this.mapLoaded(mapEvent.getMap(targetName) as unknown as Map);
      }
      mapEvent.on({
        'load-map': this.controlLoadMapSucceed
      });
    }
  }

  onBeforeUnmount() {
    this.remove();
    mapEvent.un({
      'load-map': this.controlLoadMapSucceed
    });
  }

  onPositionChanged(next: ControlPosition) {
    if (this._isControl) {
      this.position = next;
      this.remove();
      this.addTo();
    }
  }

  addTo() {
    this.control = this.initControl();
    this.map.addControl(this.control, this.position);
    this._el?.classList?.add('mapboxgl-ctrl');
    this.triggerEvent('hook:loaded', {
      map: this.map,
      mapTarget: this.targetName
    });
  }

  remove() {
    if (this.control && this.map) {
      this.map.removeControl(this.control);
      this.triggerEvent('hook:removed', {
        map: this.map,
        mapTarget: this.targetName
      });
    }
  }

  initControl(): IControl {
    const self = this;
    return {
      onAdd() {
        return self._el;
      },
      onRemove() {
        return self.map;
      }
    };
  }

  controlLoadMapSucceed({
    map,
    mapTarget
  }: {
    map: Map;
    mapTarget: string;
  }) {
    const targetName = this.targetName;
    if (mapTarget === targetName) {
      this.mapLoaded(map);
    }
  }

  mapLoaded(map: Map) {
    this.map = map;
    this.addTo();
  }
}
