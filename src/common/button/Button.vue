<template>
  <Button v-bind="buttonProps" v-on="buttonListeners">
    <slot />
  </Button>
</template>

<script lang="ts">
import Button from 'ant-design-vue/es/button/button';
import buttonProps from 'ant-design-vue/es/button/buttonTypes';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

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
    buttonListeners() {
      return Object.assign({}, this.$listeners);
    }
  }
};
</script>
