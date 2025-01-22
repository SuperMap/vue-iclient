import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';

export interface flyToLocationOptions {
  data: mapboxglTypes.FlyToOptions[];
  autoplay?: boolean;
  interval?: number;
  immediate?: boolean;
  loop?: boolean;
  defaultActiveIndex?: number;
  activeIndex?: number;
}

export default class FlyToViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  options: flyToLocationOptions;
  clearTimer: number;
  activeIndex: number;
  _playSlidesFn: () => void;
  fire: any;

  constructor(options: flyToLocationOptions) {
    super();
    this.options = options;
    this._playSlidesFn = this._playSlides.bind(this);
  }

  setMap(mapInfo: mapInfoType) {
    this.map = mapInfo.map;
    this.startTimer();
  }

  setData(data: mapboxglTypes.FlyToOptions[]) {
    this.options.data = data;
    if (this.clearTimer) {
      this.pauseTimer();
    }
    this.startTimer();
  }

  setAutoplay(autoplay: boolean) {
    this.options.autoplay = autoplay;
    if (autoplay) {
      const { data, loop } = this.options;
      if (data && this.activeIndex === data.length - 1 && !loop) {
        this.activeIndex = null;
      }
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  }

  setInterval(interval: number) {
    this.options.interval = interval;
    if (this.clearTimer) {
      this.pauseTimer();
    }
    this.startTimer();
  }

  setImmediate(immediate: boolean) {
    this.options.immediate = immediate;
  }

  setLoop(loop: boolean) {
    this.options.loop = loop;
  }

  setDefaultActiveIndex(defaultActiveIndex: number) {
    this.options.defaultActiveIndex = defaultActiveIndex;
  }

  setActiveIndex(activeIndex: number) {
    this.options.activeIndex = activeIndex;
    this._setActiveItem(activeIndex);
  }

  startTimer() {
    const { data, autoplay, interval, immediate } = this.options;
    if (!this.map || !data || !autoplay || !interval || this.clearTimer) {
      return;
    }
    if (immediate) {
      this._setActiveItem(this._getActiveIndex());
    }
    this.clearTimer = window.setInterval(this._playSlidesFn, interval);
  }

  pauseTimer() {
    if (this.clearTimer) {
      window.clearInterval(this.clearTimer);
      this.clearTimer = null;
    }
  }

  prev() {
    const activeIndex = this._getActiveIndex();
    this._setActiveItem(activeIndex - 1);
  }

  next() {
    const activeIndex = this._getActiveIndex();
    this._setActiveItem(activeIndex + 1);
  }

  goto(index: number) {
    this._setActiveItem(index);
  }

  private _getActiveIndex(): number {
    let activeIndex = this.activeIndex;
    if (typeof activeIndex !== 'number') {
      activeIndex = typeof this.options.activeIndex === 'number' ? this.options.activeIndex : this.options.defaultActiveIndex;
    }
    return activeIndex;
  }

  private _playSlides() {
    const activeIndexChanged = this._changeActiveIndex();
    if (this.activeIndex === void 0) {
      this._setActiveItem(this._getActiveIndex());
      return;
    }
    if (activeIndexChanged) {
      this._flyTo();
    }
  }

  private _changeActiveIndex(): boolean {
    const { data, loop } = this.options;
    let changed = false;
    if (this.activeIndex < data.length - 1) {
      this.activeIndex++;
      changed = true;
    } else if (loop) {
      this.activeIndex = 0;
      changed = true;
    }
    return changed;
  }

  private _setActiveItem(index: number) {
    if (typeof index !== 'number') {
      return;
    }
    const { data, loop } = this.options;
    const length = data.length;
    const prevActiveIndex = this.activeIndex;
    if (index < 0) {
      this.activeIndex = loop ? length - 1 : 0;
    } else if (index >= length) {
      this.activeIndex = loop ? 0 : length - 1;
    } else {
      this.activeIndex = index;
    }
    if (prevActiveIndex !== this.activeIndex) {
      this._flyTo();
    }
  }

  private _flyTo() {
    if (!this.map || !this.options.data) {
      return;
    }
    const nextOptions: mapboxglTypes.FlyToOptions = this.options.data[this.activeIndex];
    if (nextOptions) {
      this.map.flyTo(nextOptions);
      this.fire('flychange', { activeIndex: this.activeIndex });
    } else {
      throw Error('flyOptions is invalid.');
    }
  }

  removed() {
    this.activeIndex = null;
    this.options = null;
    this.clearTimer && window.clearInterval(this.clearTimer);
  }
}
