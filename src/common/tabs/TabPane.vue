<script lang="ts">
import { VNode } from 'vue';
import { TabPane } from 'ant-design-vue/es/tabs';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

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
  mixins: [Theme],
  inheritAttrs: false,
  props: tabPaneTypes,
  computed: {
    tabPaneProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs
      });
    },
    tabPaneListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(
      TabPane,
      {
        props: this.tabPaneProps,
        on: this.tabPaneListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
