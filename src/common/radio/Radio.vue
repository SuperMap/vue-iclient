<script lang="ts">
import Radio from 'ant-design-vue/es/radio/Radio';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';
import VueTypes from '../_utils/vue-types';

export const radioTypes = {
  defaultChecked: VueTypes.bool,
  checked: VueTypes.bool,
  disabled: VueTypes.bool,
  value: VueTypes.any,
  autoFocus: VueTypes.bool
};

export default {
  name: 'SmRadio',
  defaultComponent: Radio,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'input'
  },
  props: radioTypes,
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
