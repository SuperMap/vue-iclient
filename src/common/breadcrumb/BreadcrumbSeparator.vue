<script lang="ts">
import BreadcrumbSeparator from 'ant-design-vue/es/breadcrumb/BreadcrumbSeparator';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const breadcrumbSeparatorTypes = {
  prefixCls: VueTypes.string
};

export default {
  name: 'SmBreadcrumbSeparator',
  __ANT_BREADCRUMB_Separator: true,
  defaultComponent: BreadcrumbSeparator,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: breadcrumbSeparatorTypes
};
</script>
