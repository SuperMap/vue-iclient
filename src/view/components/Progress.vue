<template>
  <div class="sm-progress">
    <el-progress
      :percentage="percentage"
      :type="type"
      :stroke-width="strokeWidth"
      :show-text="showText"
      :width="type==='circle'?circleWidth:null"
      :color="color || progressColor"
      :status="status"
    ></el-progress>
  </div>
</template>
<script>
import Theme from '../mixin/Theme';
import Widget from "./Widget";
export default {
  name: "SmProgress",
  extends: Widget,
  mixins:[Theme],
  props: {
    percentage: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      default: "line"
    },
    strokeWidth: {
      type: Number,
      default: 10
    },
    status: {
      type: String
    },
    color: {
      type: String
    },
    circleWidth: {
      type: Number,
      default: 126
    },
    showText: {
      type: Boolean,
      default: true
    }
  },
  data(){
    return {
    }
  },
  computed:{
    progressColor(){
      return this.color || this.getColor(0);
    }
  }
};
</script>

