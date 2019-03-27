<template>
  <div class="sm-progress">
    <el-progress
      :percentage="parseFloat(percentage)"
      :type="type"
      :stroke-width="parseFloat(strokeWidth)"
      :show-text="showText"
      :width="type==='circle'?parseFloat(circleWidth):null"
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
      type: [Number,String],
      required: true
    },
    type: {
      type: String,
      default: "line"
    },
    strokeWidth: {
      type: [Number,String],
      default: 10
    },
    status: {
      type: String
    },
    color: {
      type: String
    },
    circleWidth: {
      type: [Number,String],
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

