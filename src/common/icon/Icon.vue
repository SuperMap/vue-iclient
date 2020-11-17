<template>
  <div class="sm-component-icon">
    <i
      v-if="!!iconClass"
      :class="customIconClass"
      :style="iconStyle"
    />
    <a-icon
      v-else
      :type="type"
      :style="iconStyle"
      :theme="theme"
      :twoToneColor="twoToneColor"
      :component="component"
    />
  </div>
</template>
<script>
import Theme from '../_mixin/Theme';

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
    },
    autoPrefix: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    customIconClass() {
      return this.autoPrefix ? 'sm-components-icons-' + this.iconClass : this.iconClass;
    }
  }
};
</script>
