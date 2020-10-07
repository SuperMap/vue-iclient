import { defineComponent, h, VNode } from 'vue';
import switchProps from './switchTypes';
import Switch from 'ant-design-vue/es/switch/index';

defineComponent
export default {
  name: 'SmSwitch',
  inheritAttrs: false,
  props: switchProps,
  setup () {},
  methods: {
    handleClick() {
      this.$emit('click', ...arguments);
    },
    handleChange() {
      this.$emit('change', ...arguments);
    },
    handleModelBind(next) {
      this.$emit('update:checked', next);
    }
  },
  render(): VNode {
    return h(Switch, {
      ...this.$props,
      prefixCls: 'sm-switch',
      onClick: this.handleClick,
      onChange: this.handleChange,
      'onUpdate:checked': this.handleModelBind
    }, this.$slots)
  },
  install(app: any): void {}
};