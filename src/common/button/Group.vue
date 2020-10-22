<template>
  <ButtonGroup v-bind="buttonGroupProps" :style="buttonGroupStyle" v-on="buttonGroupListeners">
    <slot />
  </ButtonGroup>
</template>

<script lang="ts">
import ButtonGroup from 'ant-design-vue/es/button/button-group';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const buttonGroupTypes = {
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default')
};

export default {
  name: 'SmButtonGroup',
  components: {
    ButtonGroup
  },
  mixins: [Theme],
  inheritAttrs: false,
  props: buttonGroupTypes,
  computed: {
    buttonGroupProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-btn-group' });
    },
    buttonGroupStyle() {
      const style = { '--text-color': this.textColorsData };
      return style;
    },
    buttonGroupListeners() {
      return Object.assign({}, this.$listeners);
    }
  }
};
</script>
