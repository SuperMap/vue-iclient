<template>
  <div class="sm-icon">
    <i :class="'el-icon-'+className" :style="[iconStyle, iconBackground, iconColor]"></i>
  </div>
</template>
<script>
import Widget from "./Widget";
import Theme from "../mixin/Theme";
export default {
  name: "SmIcon",
  extends: Widget,
  mixins: [Theme],
  props: {
    className: {
      type: String,
      default: "info"
    },
    size: {
      type: String
    },
    color: {
      type: String
    },
    weight: {
      type: String
    },
    background: {
      type: String
    }
  },
  computed: {
    iconStyle() {
      return {
        fontSize: this.size,
        fontWeight: this.weight
      };
    },
    iconColor() {
      return (this.color && { color: this.color }) || this.getTextColorStyle;
    },
    iconBackground(){
      return (this.background && { background: this.background }) || this.getBackgroundStyle;
    }
  }
};
</script>


