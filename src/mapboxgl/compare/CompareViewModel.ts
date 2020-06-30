import '../../../static/libs/mapboxgl/mapbox-gl-enhance';
import 'mapbox-gl-compare';

export type mapType = mapboxglTypes.Map;
export type orientationTypes = 'vertical' | 'horizontal';

export interface compareOptions {
  beforeMap: mapType;
  afterMap: mapType;
  target: string;
  options?: {
    orientation: orientationTypes;
    mousemove?: boolean
  }
}

export default class CompareViewModel {
  compare: any;

  constructor(options?: compareOptions) {
    this.init(options);
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
    }
  }

  removed() {
    if (this.compare) {
      this.compare.remove();
      this.compare = null;
    }
  }
}
