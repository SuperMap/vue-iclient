<script lang="ts">
import Input from 'ant-design-vue/es/input/Input';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Base from './BaseMixin.vue';

export const inputTypes = {
  ...inputProps,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle']),
  error: VueTypes.bool.def(false),
  unit: VueTypes.string
};

export default {
  name: 'SmInput',
  defaultComponent: Input,
  mixins: [Base],
  props: inputTypes,
  computed: {
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size,
        addonAfter: this.unit || this.addonAfter
      };
    },
    componentClass() {
      return {
        'sm-component-input-affix-wrapper-md': this.size === 'middle',
        'sm-component-input-error': this.error,
        'sm-component-input-unit': this.unit
      };
    }
  },
  mounted() {
    if (this.size === 'middle') {
      const inputDom = this.$el.querySelector('.sm-component-input');
      inputDom && inputDom.classList && inputDom.classList.add('sm-component-input-md');
    }
  }
};
</script>
