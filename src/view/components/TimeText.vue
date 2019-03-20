<template>
  <div class="sm-time-text" :style="timeParam.fontStyle">
    <span>{{time}}</span>
  </div>
</template>

<script>
import CommonUtil from "../util/CommonUtil";
import Widget from "./Widget";
export default {
  name: "SmTimeText",
  extends: Widget,
  data() {
    return {
      time: "",
      timeInterval: null
    };
  },
  props: {
    timeType:{
      type:String,
      default:'date'
    },
    fontStyle:{
      type:Object
    }
  },

  computed: {
    timeParam() {
      let { fontStyle, timeType } = this.$props;
      this.initTime(timeType);
      return { fontStyle, timeType };
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
  }
};
</script>


