<template>
  <div class="sm-widget-icon">
    <a-icon :type="type" :style="[iconStyle, colorStyle]" />
  </div>
</template>
<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';

export default {
  name: 'SmIcon',
  mixins: [Control, Theme],
  props: {
    type: {
      type: String,
      default: 'info'
    },
    iconStyle: {
      type: Object
    }
  },
  data() {
    return {
      colorStyle: {}
    };
  },
  watch: {
    colorGroupsData: {
      handler() {
        this.colorStyle = this.getColorStyle(0);
      }
    }
  },
  mounted() {
    this.colorStyle = !this.iconStyle || !this.iconStyle.color ? this.getColorStyle(0) : this.colorStyle;
  }
};
</script>
