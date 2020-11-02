<script lang="ts">
import { VNode } from 'vue';
import Checkbox from 'ant-design-vue/es/checkbox/Checkbox';
import VueTypes from '../_utils/vue-types';
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
  },
  render(h): VNode {
    return h(
      Checkbox,
      {
        props: this.checkboxProps,
        on: this.checkboxListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
