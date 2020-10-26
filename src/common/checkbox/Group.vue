<script lang="ts">
import { VNode } from 'vue';
import Group from 'ant-design-vue/es/checkbox/Group';
import VueTypes from '../_types/vue-types';
import Base from './BaseMixin.vue';

export const groupTypes = {
  name: VueTypes.string,
  defaultValue: VueTypes.array,
  value: VueTypes.array,
  options: VueTypes.array,
  disabled: VueTypes.bool
};

export default {
  name: 'SmCheckboxGroup',
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: groupTypes,
  computed: {
    groupListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        change: function(value) {
          vm.$emit('change', value);
        }
      });
    }
  },
  render(h): VNode {
    return h(
      Group,
      {
        props: this.checkboxProps,
        on: this.groupListeners,
        scopedSlots: this.$scopedSlots,
        style: this.checkboxStyle
      },
      this.$slots['default']
    );
  }
};
</script>
