<script lang="ts">
import Collapse from 'ant-design-vue/es/collapse/Collapse';
import { collapseProps } from 'ant-design-vue/es/vc-collapse';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const collapseTypes = {
  ...collapseProps()
};

export default {
  name: 'SmCollapse',
  defaultComponent: Collapse,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'activeKey',
    event: 'change'
  },
  props: collapseTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        'change': function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
