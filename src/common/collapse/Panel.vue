<script lang="ts">
import CollapsePanel from 'ant-design-vue/es/collapse/CollapsePanel';
import { panelProps } from 'ant-design-vue/es/vc-collapse';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const collapsePanelTypes = {
  ...panelProps()
};

export default {
  name: 'SmCollapsePanel',
  defaultComponent: CollapsePanel,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: collapsePanelTypes
};
</script>
