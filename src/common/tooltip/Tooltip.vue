<script lang="ts">
import Tooltip from 'ant-design-vue/es/tooltip/Tooltip';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

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
