<script lang="ts">
import BreadcrumbSeparator from 'ant-design-vue/es/breadcrumb/BreadcrumbSeparator';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';
import { VNode } from 'vue';

export const breadcrumbSeparatorTypes = {
  prefixCls: VueTypes.string
};

export default {
  name: 'SmBreadcrumbSeparator',
  __ANT_BREADCRUMB_SEPARATOR: true,
  mixins: [Theme],
  inheritAttrs: false,
  props: breadcrumbSeparatorTypes,
  computed: {
    breadcrumbSeparatorProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-breadcrumb' });
    }
  },
  render(h): VNode {
    return h(
      BreadcrumbSeparator,
      {
        props: this.breadcrumbSeparatorProps,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
