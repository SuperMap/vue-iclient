<template>
  <Input :value="value" v-bind="inputProps" :style="inputStyle" prefixCls="sm-component-input" v-on="inputListeners" />
</template>

<script lang="ts">
import Input from 'ant-design-vue/es/input/index';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export const inputTypes = {
  addonAfter: VueTypes.any,
  addonBefore: VueTypes.any,
  defaultValue: VueTypes.string,
  disabled: VueTypes.bool,
  id: VueTypes.string,
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
  components: {
    Input
  },
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change.value'
  },
  props: inputTypes,
  computed: {
    inputProps() {
      return objectWithoutProperties(this.$props);
    },
    inputStyle() {
      return { '--focus-color': this.getColor(0), '--box-shadow-color': getColorWithOpacity(this.hoverColorData, 0.25) };
    },
    inputListeners() {
      const vm = this;
      return Object.assign(
        {},
        this.$listeners,
        {
          // 这里确保组件配合 `v-model` 的工作
          'change.value': function(value) {
            vm.$emit('change.value', value);
          }
        }
      );
    }
  }
};
</script>
