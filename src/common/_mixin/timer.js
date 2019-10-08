export default {
  props: {
    startTiming: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: [Number, String],
      default: 3
    }
  },
  watch: {
    startTiming: {
      handler(val) {
        if (val) {
          this._start();
        } else {
          this._close();
        }
      },
      immediate: true
    },
    frequency() {
      this.resetTimer();
    }
  },
  data() {
    return {
      timer: null
    };
  },
  beforeDestroy() {
    this.startTiming && this._close();
  },
  methods: {
    _close() {
      this.timer && clearInterval(this.timer);
      this.closeTimer();
    },
    _start() {
      let time = this.frequency * 1000 || 3000;
      this.startTimer();
      this.timer = setInterval(() => {
        this.timing();
      }, time);
    },
    startTimer() {},
    timing() {},
    closeTimer() {},
    resetTimer() {
      this._close();
      this._start();
    }
  }
};
