<template>
  <div class="sm-time-text" :style="[timeParam, getBackgroundStyle, getTextColorStyle]">
    <span>{{time}}</span>
  </div>
</template>

<script>
import CommonUtil from "../util/CommonUtil";
import Theme from '../mixin/Theme';
import Widget from "./Widget";
export default {
  name: "SmTimeText",
  extends: Widget,
  mixins:[Theme],
  data() {
    return {
      time: "",
      timeInterval: null
    };
  },
  props: {
    timeType: {
      type: String,
      default: "date"
    },
    fontStyle: {
      type: Object
    }
  },
  computed: {
    timeParam() {
      let { fontStyle} = this.$props;
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
      this.time = CommonUtil.getDateTime("time", timeType);
      this.timeInterval = setInterval(() => {
        this.time = CommonUtil.getDateTime("time", timeType);
      }, 1000);
    }
  },

  mounted(){
    this.initTime(this.timeType);
  }
};
</script>


