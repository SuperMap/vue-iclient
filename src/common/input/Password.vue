<script lang="ts">
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
  defaultComponent: Password,
  mixins: [Base],
  props: inputPasswordTypes,
  computed: {
    extralProps() {
      return {
        prefixCls: this.prefixCls || 'sm-component-input-password',
        inputPrefixCls: this.inputPrefixCls || 'sm-component-input'
      };
    }
  }
};
</script>
