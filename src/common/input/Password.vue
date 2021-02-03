<script lang="ts">
import Password from 'ant-design-vue/es/input/Password';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from '../_utils/vue-types';
import Base from './BaseMixin.vue';

export const inputPasswordTypes = {
  ...inputProps,
  action: VueTypes.oneOf(['click', 'hover']).def('click'),
  visibilityToggle: VueTypes.bool.def(true),
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
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
        inputPrefixCls: this.inputPrefixCls || 'sm-component-input',
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-input-affix-wrapper-md': this.size === 'middle',
        'sm-component-input-password-md': this.size === 'middle'
      };
    }
  },
  mounted() {
    if (this.size === 'middle') {
      const inputDom = this.$el.querySelector('.sm-component-input');
      inputDom && inputDom.classList && inputDom.classList.add('sm-component-input-md');
    }
  }
};
</script>
