<template>
  <div class="sm-component-icon">
    <i
      v-if="!!iconClass"
      :class="'sm-components-icons-' + iconClass"
      :style="[iconStyle, colorStyle]"
      :theme="theme"
      :twoToneColor="twoToneColor"
      :component="component"
    />
    <a-icon
      v-else
      :type="type"
      :style="[iconStyle, colorStyle]"
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
  computed: {
    colorStyle() {
      return !this.iconStyle || !this.iconStyle.color ? this.getColorStyle(0) : { color: this.iconStyle.color };
    }
  }
};
</script>
