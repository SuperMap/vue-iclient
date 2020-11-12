<script lang="ts">
import Layout from 'ant-design-vue/es/layout';
import { SiderProps } from 'ant-design-vue/es/layout/Sider';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const layoutSiderTypes = {
  ...SiderProps
};

export default {
  name: 'SmLayoutSider',
  __ANT_LAYOUT_SIDER: true,
  defaultComponent: Layout.Sider,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'collapsed',
    event: 'collapse'
  },
  props: layoutSiderTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        'collapse': function() {
          vm.$emit('collapse', ...arguments);
        }
      };
    }
  }
};
</script>
