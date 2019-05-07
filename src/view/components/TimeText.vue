<template>
  <div class="sm-widget-time-text" :style="[timeParam, getBackgroundStyle, getTextColorStyle]">
    <span>{{time}}</span>
  </div>
</template>

<script>
import CommonUtil from "../util/CommonUtil";
import Theme from "../mixin/theme";
import Control from "../mixin/control";

import { parse } from "path";
export default {
  name: "SmTimeText",
  mixins: [Control,Theme],
  data() {
    return {
      time: "",
      timeInterval: null
    };
  },
  props: {
    timeType: {
      type: String,
      default: "date"// "date+second" "date+second+week"
    },
    fontStyle: {
      type: Object
    }
  },
  computed: {
    timeParam() {
      let fontStyle =  JSON.parse(JSON.stringify(this.fontStyle));
      fontStyle.fontSize && (fontStyle.fontSize = parseFloat(fontStyle.fontSize) + "px");
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
      this.time = CommonUtil.getDateTime("time", timeType);
      this.timeInterval = setInterval(() => {
        this.time = CommonUtil.getDateTime("time", timeType);
      }, 1000);
    }
  }
};
</script>


