<script lang="ts">
import { VNode } from 'vue';
import { TabContent } from 'ant-design-vue/es/tabs';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const tabContentTypes = {
  animated: VueTypes.bool.def(true),
  animatedWithMargin: VueTypes.bool.def(true),
  activeKey: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  tabBarPosition: VueTypes.string,
  direction: VueTypes.string,
  destroyInactiveTabPane: VueTypes.bool
};

export default {
  name: 'SmTabContent',
  mixins: [Theme],
  inheritAttrs: false,
  props: tabContentTypes,
  computed: {
    tabContentProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-tabs' });
    },
    tabContentListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(
      TabContent,
      {
        props: this.tabContentProps,
        on: this.tabContentListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
