<template>
  <BreadcrumbSeparator v-bind="breadcrumbSeparatorProps" prefixCls="sm-component-breadcrumb">
    <slot />
  </BreadcrumbSeparator>
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
  __ANT_BREADCRUMB_Separator: true,
  components: {
    BreadcrumbSeparator
  },
  mixins: [Theme],
  props: breadcrumbSeparatorTypes,
  computed: {
    breadcrumbSeparatorProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-breadcrumb-separator' });
    }
  }
};
</script>
