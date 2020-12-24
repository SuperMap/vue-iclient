<script lang="ts">
import Tree from 'ant-design-vue/es/tree';
import { TreeProps } from 'ant-design-vue/es/tree/Tree';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const treeTypes = {
  ...TreeProps()
};

export default {
  name: 'SmTree',
  defaultComponent: Tree,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'checkedKeys',
    event: 'check'
  },
  props: treeTypes,
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
