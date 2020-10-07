import { defineComponent, h, VNode } from 'vue';
import inputProps from './inputTypes';
import Input from 'ant-design-vue/es/input/index';

defineComponent
export default {
  name: 'SmInput',
  inheritAttrs: false,
  props: inputProps,
  setup () {},
  methods: {
    handleChange() {
      this.$emit('change', ...arguments);
    },
    handlePressEnter() {
      this.$emit('pressEnter', ...arguments);
    },
    handleModelBind(next) {
      this.$emit('update:value', next);
    }
  },
  render(): VNode {
    // todo 触发原生input事件，如 focus、blur等
    return h(Input, {
      ...this.$props,
      prefixCls: 'sm-input',
      onChange: this.handleChange,
      onPressEnter: this.handlePressEnter,
      'onUpdate:value': this.handleModelBind
    }, this.$slots)
  },
  install(app: any): void {}
};