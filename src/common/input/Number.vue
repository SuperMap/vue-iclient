<template>
  <InputNumber
    v-bind="inputProps"
    :style="inputNumberStyle"
    prefixCls="sm-component-input-number"
    v-on="inputListeners"
  />
</template>

<script lang="ts">
import InputNumber, { InputNumberProps } from 'ant-design-vue/es/input-number';
import Base from './BaseMixin.vue';
import { getColorWithOpacity } from '../_utils/util';

export const inputNumberTypes = {
  ...InputNumberProps
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
          vm.$emit('change', value);
        }
      });
    }
  }
};
</script>
