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
import VueTypes from '../_types/vue-types';
import Base from './BaseMixin.vue';

export const textAreaTypes = {
  defaultValue: VueTypes.string,
  disabled: VueTypes.bool,
  maxLength: VueTypes.number,
  value: VueTypes.string,
  allowClear: VueTypes.bool,
  autoSize: VueTypes.oneOfType([VueTypes.bool, VueTypes.object])
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
