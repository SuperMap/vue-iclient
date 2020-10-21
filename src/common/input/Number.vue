<template>
  <InputNumber
    v-bind="inputProps"
    :style="inputNumberStyle"
    prefixCls="sm-component-input-number"
    v-on="inputListeners"
  />
</template>

<script lang="ts">
import InputNumber from 'ant-design-vue/es/input-number';
import VueTypes from '../_types/vue-types';
import Base from './BaseMixin.vue';
import { getColorWithOpacity } from '../_utils/util';

export const inputNumberTypes = {
  autoFocus: VueTypes.bool,
  defaultValue: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  disabled: VueTypes.bool,
  formatter: VueTypes.func,
  parser: VueTypes.func,
  max: VueTypes.number,
  min: VueTypes.number,
  precision: VueTypes.number,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  decimalSeparator: VueTypes.string,
  step: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  value: VueTypes.oneOfType([VueTypes.string, VueTypes.number])
};

export default {
  name: 'SmInputNumber',
  components: {
    InputNumber
  },
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: inputNumberTypes,
  computed: {
    inputNumberStyle() {
      const style = Object.assign({}, this.inputStyle, {
        '--arrow-text-color': getColorWithOpacity(this.textColorsData, 0.45)
      });
      return style;
    },
    inputListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        // 这里确保组件配合 `v-model` 的工作
        change: function(value) {
          vm.inputValue = value;
          vm.$emit('change', value);
        }
      });
    }
  }
};
</script>
