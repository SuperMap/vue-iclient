<script lang="ts">
import { VNode } from 'vue';
import Tabs from 'ant-design-vue/es/tabs';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const tabsTypes = {
  activeKey: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  animated: VueTypes.oneOfType([VueTypes.bool, VueTypes.object]),
  defaultActiveKey: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  hideAdd: VueTypes.bool.def(false),
  size: VueTypes.oneOf(['default', 'small', 'large']),
  tabBarExtraContent: VueTypes.any,
  tabBarStyle: VueTypes.object,
  tabPosition: VueTypes.oneOf(['top', 'right', 'bottom', 'left']).def('top'),
  type: VueTypes.oneOf(['line', 'card', 'editable-card']),
  tabBarGutter: VueTypes.number
};

export default {
  name: 'SmTabs',
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'activeKey',
    event: 'change'
  },
  props: tabsTypes,
  computed: {
    tabsProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-tabs' });
    },
    tabsListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        change: function(value) {
          vm.$emit('change', value);
        }
      });
    }
  },
  render(h): VNode {
    return h(
      Tabs,
      {
        props: this.tabsProps,
        on: this.tabsListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
