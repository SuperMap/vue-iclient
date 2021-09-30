<script lang="ts">
import Tooltip from 'ant-design-vue/es/tooltip/Tooltip';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const tooltipTypes = {
  routes: VueTypes.array,
  params: VueTypes.object,
  separator: VueTypes.string,
  itemRender: VueTypes.func
};

export default {
  name: 'SmTooltip',
  defaultComponent: Tooltip,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: tooltipTypes
};
</script>
