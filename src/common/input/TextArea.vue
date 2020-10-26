<template>
  <TextArea
    v-bind="inputProps"
    :style="inputStyle"
    prefixCls="sm-component-input"
    v-on="inputListeners"
  />
</template>

<script lang="ts">
import TextArea from 'ant-design-vue/es/input/TextArea';
import inputProps from 'ant-design-vue/es/input/inputProps';
import Base from './BaseMixin.vue';

export const textAreaTypes = {
  ...inputProps
};

export default {
  name: 'SmTextarea',
  components: {
    TextArea
  },
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change.value'
  },
  props: textAreaTypes
};
</script>
