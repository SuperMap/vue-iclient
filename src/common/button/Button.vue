<template>
  <Button v-bind="buttonProps" :style="buttonStyle" v-on="buttonListeners">
    <slot />
  </Button>
</template>

<script lang="ts">
import Button from 'ant-design-vue/es/button/button';
import buttonProps from 'ant-design-vue/es/button/buttonTypes';
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export const buttonTypes = {
  ...buttonProps()
};

export default {
  name: 'SmButton',
  __ANT_BUTTON: true,
  components: {
    Button
  },
  mixins: [Theme],
  inheritAttrs: false,
  props: buttonTypes,
  computed: {
    buttonProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-btn' });
    },
    buttonStyle() {
      const style = {};
      switch (this.type) {
        case 'default':
        case 'dashed':
          style['--default-border-color'] = this.buttonBorderDefaultColorData;
          break;
        case 'danger':
          style['--danger-bg-color'] = this.dangerColorData;
          break;
      }
      if (this.disabled) {
        style['--disabled-text-color'] = getColorWithOpacity(this.textColorsData, 0.25);
        style['--disabled-border-color'] = this.disabledBorderColorData;
      }
      return style;
    },
    buttonListeners() {
      return Object.assign({}, this.$listeners);
    }
  }
};
</script>
