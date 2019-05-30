<template>
  <div class="sm-component-icon">
    <i
      v-if="!!iconClass"
      :class="'sm-components-icons-' + iconClass"
      :style="[formatIconStyle, colorStyle]"
      :theme="theme"
      :twoToneColor="twoToneColor"
      :component="component"
    />
    <a-icon
      v-else
      :type="type"
      :style="[formatIconStyle, colorStyle]"
      :theme="theme"
      :twoToneColor="twoToneColor"
      :component="component"
    />
  </div>
</template>
<script>
import Theme from '../_mixin/theme';

export default {
  name: 'SmIcon',
  mixins: [Theme],
  props: {
    type: {
      type: String,
      default: 'info'
    },
    iconStyle: {
      type: Object
    },
    theme: {
      type: String,
      default: 'outlined'
    },
    twoToneColor: {
      type: String
    },
    iconClass: {
      type: String
    },
    component: {
      type: Object
    }
  },
  data() {
    return {
      colorStyle: {}
    };
  },
  computed: {
    formatIconStyle() {
      let iconStyle = Object.assign({}, this.iconStyle);
      const fontSize = iconStyle.fontSize;
      fontSize && (iconStyle.fontSize = parseInt(fontSize) + 'px');
      return iconStyle;
    }
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
