<script lang="ts">
import BreadcrumbItem from 'ant-design-vue/es/breadcrumb/BreadcrumbItem';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const breadcrumbItemTypes = {
  href: VueTypes.string,
  overlay: VueTypes.any,
  separator: VueTypes.any
};

export default {
  name: 'SmBreadcrumbItem',
  __ANT_BREADCRUMB_ITEM: true,
  defaultComponent: BreadcrumbItem,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: breadcrumbItemTypes
};
</script>
