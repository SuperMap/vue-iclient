<script lang="ts">
import InputNumber, { InputNumberProps } from 'ant-design-vue/es/input-number';
import Base from './BaseMixin.vue';

export const inputNumberTypes = {
  ...InputNumberProps
};

export default {
  name: 'SmInputNumber',
  defaultComponent: InputNumber,
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: inputNumberTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        // 这里确保组件配合 `v-model` 的工作
        change: function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
