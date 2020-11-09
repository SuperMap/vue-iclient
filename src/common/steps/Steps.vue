<template>
  <Steps v-bind="stepProps" v-on="stepListeners">
    <slot />
  </Steps>
</template>

<script lang="ts">
import Steps from 'ant-design-vue/es/steps';
import Theme from '../_mixin/theme';
import VueTypes from '../_utils/vue-types';
import { objectWithoutProperties } from '../_utils/util';

export const stepTypes = {
  current: VueTypes.number,
  initial: VueTypes.number,
  labelPlacement: VueTypes.oneOf(['horizontal', 'vertical']).def('horizontal'),
  status: VueTypes.oneOf(['wait', 'process', 'finish', 'error']),
  size: VueTypes.oneOf(['default', 'small']),
  direction: VueTypes.oneOf(['horizontal', 'vertical']),
  progressDot: VueTypes.oneOfType([VueTypes.bool, VueTypes.func]),
  type: VueTypes.oneOf(['default', 'navigation'])
};

export default {
  name: 'SmSteps',
  components: {
    Steps
  },
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'current',
    event: 'change'
  },
  props: stepTypes,
  computed: {
    stepProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-steps' });
    },
    stepListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        'change': function (value) {
          vm.$emit('change', value);
        }
      });
    }
  }
};
</script>
