<script lang="ts">
import Tabs from 'ant-design-vue/es/tabs';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

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
  defaultComponent: Tabs,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'activeKey',
    event: 'change'
  },
  props: tabsTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        change: function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
