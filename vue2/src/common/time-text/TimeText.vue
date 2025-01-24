<template>
  <div class="sm-component-time-text" :style="[fontStyle, getBackgroundStyle, getTextColorStyle]">
    <span>{{ time }}</span>
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';

export default {
  name: 'SmTimeText',
  mixins: [Theme],
  props: {
    timeType: {
      type: String,
      default: 'date' // "date+second" "date+second+week"
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
  watch: {
    timeType() {
      this.initTime(this.timeType);
    }
  },
  mounted() {
    this.initTime(this.timeType);
  },
  destroyed() {
    clearInterval(this.timeInterval);
  },
  methods: {
    // 初始化
    initTime(timeType) {
      clearInterval(this.timeInterval);
      this.time = this.getDateTime(timeType);
      this.timeInterval = setInterval(() => {
        this.time = this.getDateTime(timeType);
      }, 1000);
    },
    getDateTime(timeType) {
      return this.$d(new Date(), timeType.replace(/\+/g, '_'));
    }
  }
};
</script>
