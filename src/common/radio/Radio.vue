<template>
  <Radio v-bind="radioProps" v-on="radioListeners">
    <slot />
  </Radio>
</template>

<script lang="ts">
import Radio from 'ant-design-vue/es/radio/Radio';
import Theme from '../_mixin/theme';
import VueTypes from '../_utils/vue-types';
import { objectWithoutProperties } from '../_utils/util';

export const radioTypes = {
  defaultChecked: VueTypes.bool,
  checked: VueTypes.bool,
  disabled: VueTypes.bool,
  value: VueTypes.any,
  autoFocus: VueTypes.bool
};

export default {
  name: 'SmRadio',
  components: {
    Radio
  },
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'input'
  },
  props: radioTypes,
  computed: {
    radioProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-radio' });
    },
    radioListeners() {
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
