<script lang="ts">
import Checkbox from 'ant-design-vue/es/checkbox/Checkbox';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const checkboxTypes = {
  defaultChecked: VueTypes.bool,
  checked: VueTypes.bool,
  disabled: VueTypes.bool,
  indeterminate: VueTypes.bool,
  autoFocus: VueTypes.bool
};

export default {
  name: 'SmCheckbox',
  __ANT_CHECKBOX: true,
  defaultComponent: Checkbox,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'input'
  },
  props: checkboxTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        input: function(value) {
          vm.$emit('input', value);
        }
      };
    }
  }
};
</script>
