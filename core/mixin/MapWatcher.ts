import { Events } from 'vue-iclient-core/types/event/Events';
import mapEvent from 'vue-iclient-core/types/map-event';

interface SetMapParams {
  map: Record<string, any>;
  webmap: InstanceType<any>;
  mapTarget: string;
}

interface ViewModel {
  setMap?: (params: SetMapParams) => void;
  removed?: () => void;
  [key: string]: any;
}

interface MountedParams {
  viewModel?: ViewModel;
}

interface EventParams {
  map: Record<string, any>;
  mapTarget: string;
}

export default class MapWatcher extends Events {
  map: Record<string, any>;
  webmap: InstanceType<any>;
  viewModel: ViewModel;
  mapTarget: string;
  firstDefaultTarget: string;
  private _parentTarget: string;

  triggerEvent: (name: string, ...rest: any) => any;
  on: (data: Record<string, (...rest: any) => void>) => void;
  un: (data: Record<string, (...rest: any) => void>) => void;
  eventTypes: string[];
  
  constructor(mapTarget: string, parentTarget?: string) {
    super();
    this.eventTypes = ['hook:loaded', 'hook:removed'];
    this.mapTarget = mapTarget;
    this._parentTarget = parentTarget;
    this.loadMapSucceed = this.loadMapSucceed.bind(this);
    this.removeMapSucceed = this.removeMapSucceed.bind(this);
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
    /**
     * 便于区分存在多个map时，子组件对应的map的渲染；
     * map 和 webmap  的 props 属性是 target 其他组件都叫 mapTarget
     * 如果子组件包裹在 map 组件里面，若没有传 mapTarget, 则 targetName 直接取父元素的target 的值
     * 如果子组件和 map 同层级，且没有设置 mapTarget 时，则默认渲染到第一个 map 上
     *
     */
    return this.mapTarget || this._parentTarget || this.firstTarget;
  }

  onMounted({ viewModel }: MountedParams = {}) {
    this.viewModel = viewModel;
    const targetName = this.targetName;
    this.firstDefaultTarget = targetName;
    if (mapEvent.getMap(targetName)) {
      this.loadMap(targetName);
    }
    mapEvent.on({
      'load-map': this.loadMapSucceed,
      'delete-map': this.removeMapSucceed
    });
  }

  onUnmounted() {
    this.removeMap();
    mapEvent.un({
      'load-map': this.loadMapSucceed,
      'delete-map': this.removeMapSucceed
    });
  }

  onMapTargetChanged(
    next: string | undefined | null,
    prev: string | undefined | null
  ) {
    this.mapTarget = next;
    const prevTarget = prev || this.firstDefaultTarget;
    if (next && next !== prevTarget) {
      // 多个map切换的时候，需要删除该组件与前一个map的图层绑定
      const prevMap = mapEvent.getMap(prevTarget);
      if (prevMap) {
        this.removeMap(prevMap, prevTarget);
      }
      if (mapEvent.getMap(next)) {
        this.loadMap(next);
      }
    }
  }

  loadMap(targetName: string) {
    if (!this.firstDefaultTarget) {
      this.firstDefaultTarget = targetName;
    }
    this.map = mapEvent.getMap(targetName);
    this.webmap = mapEvent.getWebMap(targetName);
    this.viewModel &&
      typeof this.viewModel.setMap === 'function' &&
      this.viewModel.setMap({
        map: this.map,
        webmap: this.webmap,
        mapTarget: targetName
      });
    this.triggerEvent('hook:loaded', {
      map: this.map,
      webmap: this.webmap,
      mapTarget: targetName
    });
  }

  removeMap(map = this.map, target = this.targetName) {
    if (map) {
      this.viewModel?.removed?.();
      this.triggerEvent('hook:removed', { map, mapTarget: target });
      this.map = null;
      this.webmap = null;
      this.firstDefaultTarget = null;
    }
  }

  loadMapSucceed({ mapTarget }: EventParams) {
    const targetName = this.targetName;
    if (mapTarget === targetName) {
      this.loadMap(mapTarget);
    }
  }

  removeMapSucceed({ mapTarget }: EventParams) {
    const targetName = this.targetName;
    if (mapTarget === targetName) {
      this.removeMap();
    }
  }
}
