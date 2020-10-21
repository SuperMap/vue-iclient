<template>
  <Group v-bind="inputProps" prefixCls="sm-component-input-group" v-on="inputListeners">
    <slot></slot>
  </Group>
</template>

<script lang="ts">
import Group from 'ant-design-vue/es/input/Group';
import VueTypes from '../_types/vue-types';
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
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
    },
    inputListeners() {
      return Object.assign({}, this.$listeners);
    }
  }
};
</script>
