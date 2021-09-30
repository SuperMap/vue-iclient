<script lang="ts">
import BreadcrumbSeparator from 'ant-design-vue/es/breadcrumb/BreadcrumbSeparator';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

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
