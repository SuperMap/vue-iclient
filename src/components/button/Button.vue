<template>
  <Button v-bind="$props" prefixCls="sm-btn" @click="handleClick">
    <slot />
  </Button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import buttonProps from './buttonTypes';
import Button from 'ant-design-vue/es/button/index';

defineComponent
export default {
  name: 'SmButton',
  inheritAttrs: false,
  props: buttonProps,
  components: {
    Button
  },
  setup () {
    return {}
  },
  methods: {
    handleClick() {
      this.$emit('click', ...arguments);
    }
  }
};
</script>
