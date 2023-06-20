import 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import 'mapbox-gl-compare';

export type mapType = mapboxglTypes.Map;
export type orientationTypes = 'vertical' | 'horizontal';

export interface compareOptions {
  beforeMap: mapType;
  afterMap: mapType;
  target: string;
  options?: {
    orientation: orientationTypes;
    mousemove?: boolean;
  };
}

export default class CompareViewModel {
  compare: any;
  _onScrollFn: () => void;

  constructor(options?: compareOptions) {
    this.init(options);
    this._onScrollFn = this._onScroll.bind(this);
  }

  init(nextOptions: compareOptions) {
    if (!nextOptions) {
      return;
    }
    this.removed();
    const { beforeMap, afterMap, target, options } = nextOptions;
    if (beforeMap && afterMap && target) {
      const $window: any = window;
      const mapboxgl: any = $window.mapboxgl;
      this.compare = new mapboxgl.Compare(beforeMap, afterMap, `#${target}`, options);
      this._regiterEvent();
    }
  }

  removed() {
    if (this.compare) {
      this._unregiterEvent();
      this.compare.remove();
      this.compare = null;
    }
  }

  _regiterEvent() {
    document.addEventListener('scroll', this._onScrollFn);
  }

  _unregiterEvent() {
    document.removeEventListener('scroll', this._onScrollFn);
  }

  _onScroll() {
    this.compare._bounds = this.compare._mapB.getContainer().getBoundingClientRect();
  }
}
