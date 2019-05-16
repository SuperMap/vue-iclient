<template>
  <div class="sm-widget-icon">
    <i :class="'el-icon-'+className" :style="[iconStyle, iconBackground, iconColor]"></i>
  </div>
</template>
<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';

export default {
  name: 'SmIcon',
  mixins: [Control, Theme],
  props: {
    className: {
      type: String,
      default: 'info'
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
        fontSize: parseFloat(this.size) + 'px',
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
