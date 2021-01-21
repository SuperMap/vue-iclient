<script lang="ts">
import TreeSelect, { TreeSelectProps } from 'ant-design-vue/es/tree-select';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const treeSelectTypes = {
  ...TreeSelectProps()
};

export default {
  name: 'SmTreeSelect',
  defaultComponent: TreeSelect,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'checkedKeys',
    event: 'check'
  },
  props: treeSelectTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        'check': function () {
          vm.$emit('check', ...arguments);
        }
      };
    }
  }
};
</script>
