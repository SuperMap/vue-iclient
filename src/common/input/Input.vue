<script lang="ts">
import { VNode } from 'vue';
import Input from 'ant-design-vue/es/input/Input';
import inputProps from 'ant-design-vue/es/input/inputProps';
import Base from './BaseMixin.vue';

export const inputTypes = {
  ...inputProps
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
