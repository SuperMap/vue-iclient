<template>
  <RadioButton v-bind="radioButtonProps" v-on="radioButtonListeners">
    <slot />
  </RadioButton>
</template>

<script lang="ts">
import RadioButton from 'ant-design-vue/es/radio/RadioButton';
import Theme from '../_mixin/theme';
import { radioTypes } from './Radio.vue';
import { objectWithoutProperties } from '../_utils/util';

export const radioButtonTypes = {
  ...radioTypes
};

export default {
  name: 'SmRadioButton',
  components: {
    RadioButton
  },
  mixins: [Theme],
  inheritAttrs: false,
  props: radioButtonTypes,
  computed: {
    radioButtonProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: 'sm-component-radio-button'
      });
    },
    radioButtonListeners() {
      return Object.assign({}, this.$listeners);
    }
  }
};
</script>
