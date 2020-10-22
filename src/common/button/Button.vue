<template>
  <Button v-bind="buttonProps" :style="buttonStyle" prefixCls="sm-component-btn" v-on="buttonListeners">
    <slot />
  </Button>
</template>

<script lang="ts">
import Button from 'ant-design-vue/es/button/button';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export const buttonTypes = {
  disabled: VueTypes.bool,
  ghost: VueTypes.bool,
  htmlType: VueTypes.oneOf(['button', 'submit', 'reset']).def('button'),
  icon: VueTypes.any,
  loading: VueTypes.oneOfType([VueTypes.bool, VueTypes.object]),
  shape: VueTypes.oneOf(['circle', 'circle-outline', 'round']),
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  type: VueTypes.oneOf(['primary', 'dashed', 'danger', 'link', 'default']).def('default'),
  block: VueTypes.bool
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
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
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
