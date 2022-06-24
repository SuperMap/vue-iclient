<script lang="ts">
import Tree from 'ant-design-vue/es/tree';
import { TreeProps } from 'ant-design-vue/es/tree/Tree';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

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
        check: function () {
          vm.$emit('check', ...arguments);
        }
      };
    }
  }
};
</script>
