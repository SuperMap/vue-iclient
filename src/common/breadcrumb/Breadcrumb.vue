<script lang="ts">
import Breadcrumb from 'ant-design-vue/es/breadcrumb/Breadcrumb';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const breadcrumbTypes = {
  routes: VueTypes.array,
  params: VueTypes.object,
  separator: VueTypes.any,
  itemRender: VueTypes.any
};

export default {
  name: 'SmBreadcrumb',
  defaultComponent: Breadcrumb,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: breadcrumbTypes
};
</script>
