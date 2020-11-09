<template>
  <breadcrumb-separator v-bind="breadcrumbSeparatorProps">
    <slot />
  </breadcrumb-separator>
</template>

<script lang="ts">
import BreadcrumbSeparator from 'ant-design-vue/es/breadcrumb/BreadcrumbSeparator';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const breadcrumbSeparatorTypes = {
  prefixCls: VueTypes.string
};

export default {
  name: 'SmBreadcrumbSeparator',
  __ANT_BREADCRUMB_SEPARATOR: true,
  components: {
    BreadcrumbSeparator
  },
  mixins: [Theme],
  inheritAttrs: false,
  props: breadcrumbSeparatorTypes,
  computed: {
    breadcrumbSeparatorProps() {
      console.log('...this.$props, ...this.$attrs', ...this.$props, ...this.$attrs);
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-breadcrumb' });
    }
  }
};
</script>
