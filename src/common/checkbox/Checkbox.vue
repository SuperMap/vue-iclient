<template>
  <Checkbox v-bind="checkboxProps" :style="checkboxStyle" v-on="checkboxListeners">
    <slot />
  </Checkbox>
</template>

<script lang="ts">
import Checkbox from 'ant-design-vue/es/checkbox/Checkbox';
import VueTypes from '../_types/vue-types';
import Base from './BaseMixin.vue';

export const checkboxTypes = {
  defaultChecked: VueTypes.bool,
  checked: VueTypes.bool,
  disabled: VueTypes.bool,
  indeterminate: VueTypes.bool,
  autoFocus: VueTypes.bool
};

export default {
  name: 'SmCheckbox',
  __ANT_CHECKBOX: true,
  components: {
    Checkbox
  },
  mixins: [Base],
  model: {
    prop: 'checked',
    event: 'input'
  },
  props: checkboxTypes,
  computed: {
    checkboxListeners() {
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
