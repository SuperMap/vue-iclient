<template>
  <div class="sm-component-time-slider" dir="ltr" :style="[getBackgroundStyle,newThemeStyle]">
    <button class="sm-play-control sm-control sm-button sm-paused" @click="changePlayState">
      <i
        :class="['sm-icon-play', playState ? 'sm-components-icon-zanting' : 'sm-components-icon-bofang3']"
      />
    </button>
    <div class="sm-progress-control sm-control" :style="{background: '#515659',...lineStyle}">
      <div class="sm-progress-holder" @click="handleMouseClick" @mousemove="handleMouseMove">
        <div
          class="sm-load-progress"
          :style="{ ...lineStyleHeight, 'padding-left': sliderBarWidth }"
        ></div>
        <div class="sm-mouse-display" :style="{ left: mouseLeft + 'px' }">
          <div v-show="mouseCurrent" class="sm-time-tooltip">{{ mouseCurrent }}</div>
        </div>
        <div
          class="sm-play-progress sm-slider-bar"
          :style="{ ...playProgressStyle, width: sliderBarWidth }"
        >
          <!-- <div class="sm-play-seek-bar draggable" :style="{...checkpointStyle}"></div> -->
          <!-- <div v-show="current" class="sm-time-tooltip" style="right: -19.6797px;">{{ current }}</div> -->
        </div>
        <div v-show="showLabel" class="sm-time-node" :style="newLabelStyle">
          <div class="sm-start-node">{{ startFormat }}</div>
          <div class="sm-end-node">{{ endFormat }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang ='ts'>
import Theme from '../_mixin/Theme';
import { getColorWithOpacity } from '../_utils/util';
import interact from 'interactjs';
import moment from 'moment';
import { Component, Prop, Mixins, Emit, Watch } from 'vue-property-decorator';

type Label = {
  formatter?: Function;
  show?: boolean;
};

type lineStyle = {
  height: string;
};
@Component({
  name: 'SmTimeSlider'
})
export default class SmTimeSlider extends Mixins(Theme) {
  mouseTime: string | number = 0;
  mouseLeft = 0;
  currentTime = 0;
  playState = false;
  sliderBarWidth = '0%';
  status = false;
  updateInterval: any;
  rafIds_: Object;
  namedRafs_: any;
  draggable: boolean;
  progress_: number;

  @Prop({ default: false }) autoPlay: boolean;
  @Prop({ default: true }) loop: boolean;
  @Prop({ default: 1000 }) playInterval: number;
  @Prop() duration: number;
  @Prop({
    default() {
      return [];
    }
  })
  data: Array<any>;
  @Prop({
    default() {
      return {};
    }
  })
  label: Label;
  @Prop({
    default() {
      return {};
    }
  })
  lineStyle: lineStyle;

  @Prop({
    default() {
      return {};
    }
  })
  checkpointStyle: Object;

  @Prop({
    default() {
      return {};
    }
  })
  themeStyle: Object;

  get color() {
    return this.getColor(0);
  }
  get showLabel() {
    if (!this.label || !Object.prototype.hasOwnProperty.call(this.label, 'show')) {
      return true;
    }
    return this.label.show;
  }
  get formatter() {
    return (this.label || {}).formatter;
  }
  get newThemeStyle() {
    return Object.assign({ color: this.color }, this.themeStyle || {});
  }
  get newLabelStyle() {
    const labelStyle = { ...this.label };
    delete labelStyle.formatter;
    return Object.assign({ color: this.color }, labelStyle || {});
  }
  get isDataDuration() {
    return !this.duration;
  }
  get startValue() {
    return this.isDataDuration ? this.data[0] : 0;
  }
  get endValue() {
    if (!this.isDataDuration) {
      return this.duration;
    }
    const length = this.data.length;
    if (length < 1) {
      return '';
    }
    const end = this.data[length - 1];
    return end;
  }
  get startFormat() {
    if (this.startValue === void 0) {
      return '';
    }
    return this.formatTime(this.startValue);
  }
  get endFormat() {
    return this.formatTime(this.endValue);
  }
  get UPDATE_REFRESH_INTERVAL() {
    return this.playInterval / 30;
  }
  get playbackRate() {
    if (!this.isDataDuration) {
      return this.UPDATE_REFRESH_INTERVAL;
    }
    if (!this.data || this.data.length < 2) {
      return 0;
    }
    const length = this.data.length;
    const totalInterval = this.playInterval * (length - 1);
    const rate = this.dataDuration / (totalInterval / this.UPDATE_REFRESH_INTERVAL);
    return rate * 1000;
  }
  get current() {
    const current = (this.isDataDuration ? this.currentTime / 1000 : this.currentTime) + this.startValue;
    return this.formatTime(current);
  }
  get mouseCurrent() {
    if (this.isDataDuration && (!this.data || this.data.length === 0)) {
      return '';
    }
    const current = this.mouseTime + this.startValue;
    return this.formatTime(current);
  }
  get lineStyleHeight() {
    if (this.lineStyle && this.lineStyle.hasOwnProperty('height')) {
      return { height: this.lineStyle.height };
    }
    return { height: '5px' };
  }
  get playProgressStyle() {
    const checkpointStyle = Object.assign(
      { 'border-color': this.color, background: this.color },
      this.checkpointStyle || {}
    );

    if (checkpointStyle && checkpointStyle.background) {
      return { background: getColorWithOpacity(checkpointStyle.background, 0.6) };
    }
    return {};
  }
  get dataDuration() {
    if (this.isDataDuration) {
      const data = this.data || [];
      const start = parseInt(data[0]) || 0;
      const end = data.length > 1 ? parseInt(data[data.length - 1]) : start;
      return end - start || 0;
    }
    return 0;
  }

  @Watch('checkpointStyle', { immediate: true })
  checkpointStyleWatcher() {
    let style = '';
    const checkpointStyle = Object.assign({ 'border-color': this.color, background: this.color }, this.checkpointStyle);
    for (let key in checkpointStyle) {
      style += `${key}: ${this.checkpointStyle[key]} !important;`;
    }
    // @ts-ignore
    document.styleSheets[0].addRule('.sm-component-time-player .sm-load-progress:before', style);
  }

  @Watch('currentTime', { immediate: true })
  currentTimeWatcher() {
    if (
      (this.isDataDuration && this.currentTime >= this.dataDuration * 1000) ||
      (!this.isDataDuration && this.currentTime >= this.duration)
    ) {
      if (!this.loop) {
        this.emitEnd();
      } else if (this.loop && this.playState) {
        this.currentTime = 0;
      }
    }
    this.timePlayerChange();
  }

  @Watch('autoPlay', { immediate: true })
  autoPlayWatcher() {
    this.autoPlay ? this.emitPlaying() : this.emitPause();
  }

  @Watch('playState', { immediate: true })
  playStateWatcher() {
    this.emitTimePlayerPlay();
  }

  mounted() {
    this.$nextTick(() => this.bindDrag('sm-load-progress'));
    this.$on('playing', this.enableInterval_);
    this.$on('pause', this.disableInterval_);
    this.$on('end', this.disableInterval_);
    this.init();
  }
  beforeDestroy() {
    this.$off('playing', this.enableInterval_);
    this.$off('pause', this.disableInterval_);
    this.$off('end', this.disableInterval_);
  }

  init() {
    this.autoPlay ? this.emitPlaying() : this.emitPause();
  }
  bindDrag(className) {
    interact(`.${className}`).draggable({
      startAxis: 'x',
      lockAxis: 'x',
      enabled: true,
      cursorChecker: (action, interactable, element, interacting) => {
        return 'pointer';
      },
      listeners: {
        start: event => {
          this.handleDragStart(event, className);
        },
        move: event => {
          this.draggable && this.handleDragMove(event, className);
        }
      }
    });
  }
  changePlayState() {
    this.playState = !this.playState;
    this.playState ? this.emitPlaying() : this.emitPause();
  }
  updateDom() {
    if (!this.$el) {
      return '';
    }
    const progress = this.getProgress();
    if (progress === this.progress_) {
      return progress;
    }
    this.progress_ = progress;
    if (!this.draggable) {
      this.requestNamedAnimationFrame('Slider#update', () => {
        this.sliderBarWidth = (progress * 100).toFixed(2) + '%';
      });
    }
    this.sliderBarWidth = (progress * 100).toFixed(2) + '%';
    return progress;
  }
  handleMouseClick(event, offsetX) {
    const newTime = this.getCurrentTime_(event, offsetX);
    this.setcurrentTime(newTime);
    if (this.playState) {
      setTimeout(this.updateDom, 1000);
    } else {
      this.updateDom();
    }
  }
  handleMouseMove(event, offsetX) {
    const newTime = this.getCurrentTime_(event, offsetX);
    this.mouseTime = newTime;
    this.mouseLeft = event.offsetX;
  }
  handleDragStart(event, className) {
    const totalDistance = this.getTotalDistance(className);
    const percent = this.getPercent();
    const position = percent * totalDistance;
    if (this.mouseLeft + 5 < position || this.mouseLeft - 5 > position) {
      this.draggable = false;
    } else {
      this.draggable = true;
    }
  }
  handleDragMove(event, className) {
    const totalDistance = this.getTotalDistance(className);
    const distance = event.dx / totalDistance + this.getProgress();
    this.handleMouseClick(event, distance);
    this.handleMouseMove(event, distance);
  }
  setcurrentTime(time) {
    if (typeof time !== 'undefined') {
      if (time < 0) {
        time = 0;
      }
      this.currentTime = this.isDataDuration ? time * 1000 : time;
      return '';
    }
    return this.currentTime || 0;
  }
  getTotalDistance(className = 'sm-load-progress') {
    // @ts-ignore
    return document.getElementsByClassName(className)[0].offsetWidth;
  }
  getProgress() {
    return Number(this.clamp(this.getPercent(), 0, 1).toFixed(4));
  }
  getPercent() {
    if (this.isDataDuration) {
      const currentTime = this.currentTime / 1000;
      const percent = currentTime / this.dataDuration;
      return percent;
    }
    return this.currentTime / this.duration;
  }
  getCurrentTime_(event, percent, className = 'sm-load-progress') {
    const distance = event.offsetX;
    const totalDistance = this.getTotalDistance(className);
    percent = percent || distance / totalDistance;
    let newTime = percent * (this.isDataDuration ? this.dataDuration : this.duration);
    if (newTime === Infinity) {
      return '';
    }
    return newTime;
  }
  clamp(number, min, max) {
    number = Number(number);
    return Math.min(max, Math.max(min, isNaN(number) ? min : number));
  }
  enableInterval_() {
    this.playState = true;
    if (this.updateInterval) {
      return;
    }
    this.updateInterval = setInterval(() => {
      this.currentTime += this.playbackRate;
      if (this.isDataDuration) {
        this.currentTime = this.currentTime / 1000 >= this.dataDuration ? this.dataDuration : this.currentTime;
      } else {
        this.currentTime = this.currentTime >= this.duration ? this.duration : this.currentTime;
      }
      this.updateDom();
    }, this.UPDATE_REFRESH_INTERVAL);
  }
  disableInterval_(e) {
    if (!this.updateInterval) {
      return;
    }
    clearInterval(this.updateInterval);
    this.updateInterval = null;
    this.playState = false;
  }
  requestAnimationFrame(fn) {
    // @ts-ignore
    if (!this.supportsRaf_) {
      return setTimeout(fn, 1000 / 60);
    }

    var id;

    fn = fn.bind(this);

    id = window.requestAnimationFrame(() => {
      // @ts-ignore
      if (this.rafIds_.has(id)) {
        // @ts-ignore
        this.rafIds_.delete(id);
      }
      fn();
    });
    // @ts-ignore
    this.rafIds_.add(id);

    return id;
  }
  requestNamedAnimationFrame(name, fn) {
    if (!this.namedRafs_) {
      this.namedRafs_ = {};
    }

    fn = fn.bind(this);
    const id = this.requestAnimationFrame(() => {
      fn();
      if (this.namedRafs_.hasOwnProperty(name)) {
        delete this.namedRafs_.name;
      }
    });
    this.namedRafs_[name] = id;
    return name;
  }
  cancelNamedAnimationFrame(name) {
    if (!this.namedRafs_.has(name)) {
      return;
    }
    this.cancelAnimationFrame(this.namedRafs_.get(name));
    this.namedRafs_.delete(name);
  }
  cancelAnimationFrame(id) {
    if (!this.rafIds_) {
      this.rafIds_ = {};
    }

    if (this.rafIds_.hasOwnProperty(id)) {
      delete this.rafIds_[id];
      window.cancelAnimationFrame(id);
    }
    return id;
  }
  formatTime(timestamp) {
    // timestamp
    if (this.formatter) {
      return this.formatter(timestamp);
    }
    const defaultFormat = this.isDataDuration ? 'YYYY-MM--DD HH:mm:ss' : 'HH:mm:ss';
    const date = this.isDataDuration ? this.timestamp2Date(timestamp) : this.duration2Date(timestamp);
    // 判断是否是Date格式
    if (!moment(date, defaultFormat).isValid()) {
      return timestamp;
    }
    return date;
  }

  @Emit('timeplayerchanged')
  timePlayerChange(currentTime = this.currentTime) {
    const currentTimeStamp = this.currentTime + this.startValue * 1000;
    if (this.isDataDuration) {
      // @ts-ignore
      const lastIndex: number = this.data.findIndex((val, index) => {
        if (index < this.data.length - 1) {
          const nextData = this.data[index + 1];
          const timestamp = val * 1000;
          const nextTimestamp = nextData * 1000;
          if (timestamp <= currentTimeStamp && nextTimestamp > currentTimeStamp) {
            return true;
          }
        }
      });
      const nextIndex = lastIndex === -1 ? -1 : lastIndex + 1 <= this.data.length ? lastIndex + 1 : lastIndex;
      return { currentTimeStamp, lastIndex, nextIndex };
    } else {
      return { currentDuration: currentTimeStamp };
    }
  }
  timestamp2Date(timestamp) {
    return timestamp ? moment(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : '';
  }
  duration2Date(duration = this.duration) {
    const $moment = moment.duration(duration, 'milliseconds');
    const hours = this.getZeroPlaceholder($moment.hours());
    const minutes = this.getZeroPlaceholder($moment.minutes());
    const seconds = this.getZeroPlaceholder($moment.seconds());
    return [hours, minutes, seconds].join(':');
  }
  getZeroPlaceholder(val) {
    if (val === 0) {
      return '00';
      // @ts-ignore
    } else if (parseInt(val / 10) <= 0) {
      return `0${val}`;
    } else {
      return val;
    }
  }

  @Emit('playing')
  emitPlaying() {}

  @Emit('pause')
  emitPause() {}
  @Emit('end')
  emitEnd() {}

  @Emit('timeplayerplaychanged')
  emitTimePlayerPlay() {
    return this.playState;
  }
}
</script>
