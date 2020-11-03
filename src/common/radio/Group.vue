<template>
  <RadioGroup v-bind="radioGroupProps" v-on="radioGroupListeners">
    <slot />
  </RadioGroup>
</template>

<script lang="ts">
import RadioGroup from 'ant-design-vue/es/radio/Group';
import Theme from '../_mixin/theme';
import VueTypes from '../_utils/vue-types';
import { objectWithoutProperties } from '../_utils/util';

export const radioGroupTypes = {
  defaultValue: VueTypes.any,
  value: VueTypes.any,
  disabled: VueTypes.bool,
  name: VueTypes.string,
  options: VueTypes.array,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  buttonStyle: VueTypes.string.def('outline')
};

export default {
  name: 'SmRadioGroup',
  components: {
    RadioGroup
  },
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'input'
  },
  props: radioGroupTypes,
  computed: {
    radioGroupProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: 'sm-component-radio',
        groupPrefixCls: 'sm-component-radio-group'
      });
    },
    radioGroupListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        input: function(value) {
          vm.$emit('input', value);
        }
      });
    }
  }
};
</script>
