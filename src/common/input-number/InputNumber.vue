<script lang="ts">
import InputNumber, { InputNumberProps } from 'ant-design-vue/es/input-number';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Base from 'vue-iclient/src/common/input/BaseMixin.vue';

export const inputNumberTypes = {
  ...InputNumberProps,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle']),
  error: VueTypes.bool.def(false)
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
    },
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-input-number-md': this.size === 'middle',
        'sm-component-input-number-error': this.error === true
      };
    }
  }
};
</script>
