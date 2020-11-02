<template>
  <Group v-bind="inputProps" v-on="inputListeners">
    <slot></slot>
  </Group>
</template>

<script lang="ts">
import Group from 'ant-design-vue/es/input/Group';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const inputGroupTypes = {
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  compact: VueTypes.bool
};

export default {
  name: 'SmInputGroup',
  components: {
    Group
  },
  mixins: [Theme],
  props: inputGroupTypes,
  computed: {
    inputProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-input-group' });
    },
    inputListeners() {
      return Object.assign({}, this.$listeners);
    }
  }
};
</script>
