<script lang="ts">
import Dropdown, { DropdownProps } from 'ant-design-vue/es/dropdown';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const dropdownTypes = {
  ...DropdownProps
};

export default {
  name: 'SmDropdown',
  defaultComponent: Dropdown,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'visible',
    event: 'visibleChange'
  },
  props: dropdownTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        visibleChange: function(value) {
          vm.$emit('visibleChange', value);
        }
      };
    }
  }
};
</script>
