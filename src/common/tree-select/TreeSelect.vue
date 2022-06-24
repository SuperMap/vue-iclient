<script lang="ts">
import TreeSelect, { TreeSelectProps } from 'ant-design-vue/es/tree-select';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const treeSelectTypes = {
  ...TreeSelectProps(),
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
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
        check: function () {
          vm.$emit('check', ...arguments);
        }
      };
    },
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-select-md': this.size === 'middle'
      };
    }
  }
};
</script>
