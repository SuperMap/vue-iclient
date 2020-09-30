<template>
  <Switch v-bind="$props" prefixCls="sm-switch" @click="handleClick" @change="handleChange" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import switchProps from './switchTypes';
import Switch from 'ant-design-vue/es/switch/index';

defineComponent
export default {
  name: 'SmSwitch',
  inheritAttrs: false,
  props: switchProps,
  components: {
    Switch
  },
  setup () {
    return {}
  },
  methods: {
    handleClick() {
      this.$emit('click', arguments);
    },
    handleChange() {
      this.$emit('change', arguments);
    }
  }
};
</script>
