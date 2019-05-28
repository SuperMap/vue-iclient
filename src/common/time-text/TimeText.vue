<template>
  <div class="sm-widget-time-text" :style="[timeParam, getBackgroundStyle, getTextColorStyle]">
    <span>{{ time }}</span>
  </div>
</template>

<script>
import { getDateTime } from '../_utils/util';
import Theme from '../_mixin/theme';

export default {
  name: 'SmTimeText',
  mixins: [Theme],
  props: {
    timeType: {
      type: String,
      default: 'date'// "date+second" "date+second+week"
    },
    fontStyle: {
      type: Object
    }
  },
  data() {
    return {
      time: '',
      timeInterval: null
    };
  },
  computed: {
    timeParam() {
      let fontStyle = JSON.parse(JSON.stringify(this.fontStyle));
      fontStyle.fontSize && (fontStyle.fontSize = parseFloat(fontStyle.fontSize) + 'px');
      this.initTime(this.timeType);
      return fontStyle;
    }
  },
  destroyed() {
    clearInterval(this.timeInterval);
  },
  methods: {
    // 初始化
    initTime(timeType) {
      clearInterval(this.timeInterval);
      this.time = getDateTime('time', timeType);
      this.timeInterval = setInterval(() => {
        this.time = getDateTime('time', timeType);
      }, 1000);
    }
  }
};
</script>
