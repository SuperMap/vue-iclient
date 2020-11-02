<script lang="ts">
import { VNode } from 'vue';
import Select from 'ant-design-vue/es/select';
import VueTypes from '../_utils/vue-types';
import { objectWithoutProperties } from '../_utils/util';

export const optionTypes = {
  disabled: VueTypes.bool,
  key: VueTypes.string,
  title: VueTypes.string,
  value: VueTypes.oneOfType([VueTypes.string, VueTypes.number])
};

export default {
  name: 'SmSelectOption',
  isSelectOption: true,
  inheritAttrs: false,
  props: optionTypes,
  computed: {
    optionProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
    },
    optionListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(Select.Option, {
      props: this.optionProps,
      on: this.optionListeners
    });
  }
};
</script>
