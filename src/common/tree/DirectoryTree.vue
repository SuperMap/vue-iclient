<script lang="ts">
import DirectoryTree from 'ant-design-vue/es/tree/DirectoryTree';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';
import VueTypes from '../_utils/vue-types';

export const directoryTreeTypes = {
  expandAction: VueTypes.oneOf(['false', 'click', 'dblclick']).def('click')
};

export default {
  name: 'SmDirectoryTree',
  defaultComponent: DirectoryTree,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'checkedKeys',
    event: 'check'
  },
  props: directoryTreeTypes,
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
