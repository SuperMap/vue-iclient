<template>
  <div class="sm-icon">
    <i :class="'el-icon-'+className" :style="[iconStyle, iconBackground, iconColor]"></i>
  </div>
</template>
<script>
import Widget from "./Widget";
import Theme from "../mixin/Theme";
import { parse } from "@babel/parser";
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
      type: [String, Number]
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
        fontSize: parseFloat(this.size) + "px",
        fontWeight: this.weight
      };
    },
    iconColor() {
      return (this.color && { color: this.color }) || this.getColorStyle(0);
    },
    iconBackground() {
      return (
        (this.background && { background: this.background }) ||
        this.getBackgroundStyle
      );
    }
  }
};
</script>


