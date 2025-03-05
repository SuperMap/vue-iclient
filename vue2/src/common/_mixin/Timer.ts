import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class Timer extends Vue {
  timer: any = null;

  @Prop({ default: false }) startTiming: boolean;

  @Prop({ default: 3 }) frequency: number | string;

  @Watch('startTiming', { immediate: true })
  onStartTimingChange(newValue: boolean) {
    if (newValue) {
      this._start();
    } else {
      this._close();
    }
  }

  @Watch('frequency')
  onFrequencyChange() {
    if (this.startTiming) {
      this.resetTimer();
    }
  }

  _start() {
    let time: number = 1000 * <number>this.frequency || 3000;
    this.startTimer();
    this.timer = setInterval(() => {
      this.timing();
    }, time);
  }

  _close() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.closeTimer();
  }

  startTimer() {}

  timing() {}

  closeTimer() {}

  resetTimer() {
    this._close();
    this._start();
  }

  beforeDestroy() {
    this.startTiming && this._close();
  }
}
