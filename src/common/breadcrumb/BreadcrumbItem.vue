<script lang="ts">
import BreadcrumbItem from 'ant-design-vue/es/breadcrumb/BreadcrumbItem';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';
import { VNode } from 'vue';

export const breadcrumbItemTypes = {
  href: VueTypes.string,
  overlay: VueTypes.any,
  separator: VueTypes.any
};

export default {
  name: 'SmBreadcrumbItem',
  __ANT_BREADCRUMB_ITEM: true,
  mixins: [Theme],
  props: breadcrumbItemTypes,
  computed: {
    breadcrumbItemProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-breadcrumb-item' });
    }
  },
  render(h): VNode {
    return h(
      BreadcrumbItem,
      {
        props: this.breadcrumbItemProps,
        scopedSlots: this.$scopedSlots,
        on: this.breadcrumbItemListeners
      },
      this.$slots['default']
    );
  }
};
</script>
