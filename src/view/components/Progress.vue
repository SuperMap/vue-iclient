<template>
  <div class="sm-progress">
    <el-progress
      :percentage="parseFloat(percentage)"
      :type="type"
      :stroke-width="parseFloat(strokeWidth)"
      :show-text="showText"
      :width="type==='circle'?parseFloat(circleWidth):null"
      :color="curColor"
      :status="status"
    ></el-progress>
  </div>
</template>
<script>
import Theme from "../mixin/Theme";
import Widget from "./Widget";
export default {
  name: "SmProgress",
  extends: Widget,
  mixins: [Theme],
  props: {
    percentage: {
      type: [Number, String],
      required: true
    },
    type: {
      type: String,
      default: "line"
    },
    strokeWidth: {
      type: [Number, String],
      default: 10
    },
    status: {
      type: String
    },
    color: {
      type: String,
      default: "#cccccc"
    },
    circleWidth: {
      type: [Number, String],
      default: 126
    },
    showText: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      curColor: ""
    };
  },
  watch: {
    color: {
      handler() {
        this.curColor = this.color;
      }
    },
    colorGroupsData: {
      handler() {
        this.curColor = this.getColor(0);
      }
    }
  }
};
</script>

