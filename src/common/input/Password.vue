<script lang="ts">
import { VNode } from 'vue';
import Password from 'ant-design-vue/es/input/Password';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from '../_utils/vue-types';
import Base from './BaseMixin.vue';

export const inputPasswordTypes = {
  ...inputProps,
  action: VueTypes.oneOf(['click', 'hover']).def('click'),
  visibilityToggle: VueTypes.bool.def(true)
};

export default {
  name: 'SmInputPassword',
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change.value'
  },
  props: inputPasswordTypes,
  render(h): VNode {
    return h(Password, {
      props: {
        ...this.inputProps,
        prefixCls: 'sm-component-input-password',
        inputPrefixCls: 'sm-component-input'
      },
      on: this.inputListeners,
      scopedSlots: this.$scopedSlots
    });
  }
};
</script>
