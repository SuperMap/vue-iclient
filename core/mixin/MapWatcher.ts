import { Events } from 'vue-iclient-core/types/event/Events';

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

interface ParentInfo {
  name: string;
  target: string | undefined | null;
}

interface MountedParams {
  viewModel?: ViewModel;
  mapTarget?: string | null;
}

interface EventParams {
  map: Record<string, any>;
  mapTarget: string;
}

interface MapEvent extends InstanceType<typeof Events> {
  getAllMaps: () => Record<string, Record<string, any>>;
  getMap: (target: string) => Record<string, any> | undefined;
  getWebMap: (target: string) => InstanceType<any> | undefined;
  [key: string]: any;
}

export default class MapWatcher extends Events {
  map: Record<string, any>;
  webmap: InstanceType<any>;
  viewModel: ViewModel;
  mapTarget: string;
  firstDefaultTarget: string;
  _mapEvent: MapEvent;
  _parentInfo: ParentInfo | undefined;

  constructor(mapEvent: MapEvent, mapTarget: string, parentInfo?: ParentInfo) {
    super();
    this.eventTypes = ['hook:loaded', 'hook:removed'];
    this._mapEvent = mapEvent;
    this.mapTarget = mapTarget;
    this._parentInfo = parentInfo;
    this.loadMapSucceed = this.loadMapSucceed.bind(this);
    this.removeMapSucceed = this.removeMapSucceed.bind(this);
  }

  get firstTarget(): string {
    let targetName: string;
    const mapList = this._mapEvent.getAllMaps();
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
    const selfParent = this._parentInfo;
    const parentTarget =
      ['smwebmap', 'smncpmap'].includes(selfParent?.name?.toLowerCase()) &&
      selfParent.target;
    return this.mapTarget || parentTarget || this.firstTarget;
  }

  mounted({ viewModel }: MountedParams = {}) {
    this.viewModel = viewModel;
    const targetName = this.targetName;
    this.firstDefaultTarget = targetName;
    if (this._mapEvent.getMap(targetName)) {
      this.loadMap(targetName);
    }
    this._mapEvent.on({
      'load-map': this.loadMapSucceed,
      'delete-map': this.removeMapSucceed
    });
  }

  unmounted() {
    this.removeMap();
    this._mapEvent.un({
      'load-map': this.loadMapSucceed,
      'delete-map': this.removeMapSucceed
    });
  }

  onMapTargetChanged(
    next: string | undefined | null,
    prev: string | undefined | null
  ) {
    this.mapTarget = next;
    if (next && prev && next !== prev) {
      // 多个map切换的时候，需要删除该组件与前一个map的图层绑定
      const prevTarget = prev || this.firstDefaultTarget;
      const prevMap = this._mapEvent.getMap(prevTarget);
      if (prevMap) {
        this.removeMap(prevMap, prevTarget);
      }
      if (this._mapEvent.getMap(next)) {
        this.loadMap(next);
      }
    }
  }

  loadMap(targetName: string) {
    if (!this.firstDefaultTarget) {
      this.firstDefaultTarget = targetName;
    }
    this.map = this._mapEvent.getMap(targetName);
    this.webmap = this._mapEvent.getWebMap(targetName);
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
