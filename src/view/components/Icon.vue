<template>
  <div class="sm-icon" :style="{background}">
    <i :class="'el-icon-'+className" :style="iconStyle"></i>
  </div>
</template>
<script>
import Widget from "./Widget";
export default {
  name: "SmIcon",
  extends: Widget,
  props: {
    className: {
      type: String,
      default: 'info'
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
      type: String,
      default: "white"
    }
  },
  computed: {
    iconStyle() {
      return {
        fontSize: this.size,
        color: this.color,
        fontWeight: this.weight
      };
    }
  }
};
</script>


