<script lang="ts">
import { TabPane } from 'ant-design-vue/es/tabs';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const tabPaneTypes = {
  active: VueTypes.bool,
  destroyInactiveTabPane: VueTypes.bool,
  forceRender: VueTypes.bool,
  placeholder: VueTypes.any,
  rootPrefixCls: VueTypes.string,
  tab: VueTypes.any,
  closable: VueTypes.bool,
  disabled: VueTypes.bool
};

export default {
  name: 'SmTabPane',
  __ANT_TAB_PANE: true,
  defaultComponent: TabPane,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: tabPaneTypes
};
</script>
