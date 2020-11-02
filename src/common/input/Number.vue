<script lang="ts">
import { VNode } from 'vue';
import InputNumber, { InputNumberProps } from 'ant-design-vue/es/input-number';
import Base from './BaseMixin.vue';

export const inputNumberTypes = {
  ...InputNumberProps
};

export default {
  name: 'SmInputNumber',
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: inputNumberTypes,
  computed: {
    inputListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        // 这里确保组件配合 `v-model` 的工作
        change: function(value) {
          vm.$emit('change', value);
        }
      });
    }
  },
  render(h): VNode {
    return h(
      InputNumber,
      {
        props: {
          ...this.inputProps,
          prefixCls: 'sm-component-input-number'
        },
        on: this.inputListeners,
        scopedSlots: this.$scopedSlots
      }
    );
  }
};
</script>
