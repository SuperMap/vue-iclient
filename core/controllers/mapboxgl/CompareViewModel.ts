import Compare from 'mapbox-gl-compare-enhanced'
import type mapboxglTypes from 'mapbox-gl'

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
      this.compare = new Compare(beforeMap, afterMap, `#${target}`, options);
    }
  }

  removed() {
    if (this.compare) {
      this.compare.remove();
      this.compare = null;
    }
  }

  refreshRect() {
    if(this.compare) {
      this.compare._bounds = this.compare._mapB.getContainer().getBoundingClientRect();
    }
  }
}
