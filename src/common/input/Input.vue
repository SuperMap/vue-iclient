<script lang="ts">
import { VNode } from 'vue';
import Input from 'ant-design-vue/es/input/Input';
import VueTypes from '../_types/vue-types';
import Base from './BaseMixin.vue';

export const inputTypes = {
  addonAfter: VueTypes.any,
  addonBefore: VueTypes.any,
  defaultValue: VueTypes.string,
  disabled: VueTypes.bool,
  maxLength: VueTypes.number,
  prefix: VueTypes.any,
  suffix: VueTypes.any,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  type: VueTypes.string.def('text'),
  value: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  allowClear: VueTypes.bool,
  loading: VueTypes.bool
};

export default {
  name: 'SmInput',
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change.value'
  },
  props: inputTypes,
  render(h): VNode {
    return h(
      Input,
      {
        props: {
          ...this.inputProps,
          prefixCls: 'sm-component-input'
        },
        on: this.inputListeners,
        scopedSlots: this.$scopedSlots,
        style: this.inputStyle
      }
    );
  }
};
</script>
