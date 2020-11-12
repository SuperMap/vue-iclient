<script lang="ts">
import RadioGroup from 'ant-design-vue/es/radio/Group';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const radioGroupTypes = {
  defaultValue: VueTypes.any,
  value: VueTypes.any,
  disabled: VueTypes.bool,
  name: VueTypes.string,
  options: VueTypes.array,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  buttonStyle: VueTypes.string.def('outline')
};

export default {
  name: 'SmRadioGroup',
  defaultComponent: RadioGroup,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'input'
  },
  props: radioGroupTypes,
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
