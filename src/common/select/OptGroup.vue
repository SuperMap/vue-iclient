<script lang="ts">
import { VNode } from 'vue';
import Select from 'ant-design-vue/es/select';
import VueTypes from '../_types/vue-types';
import { objectWithoutProperties } from '../_utils/util';

export const optGroupTypes = {
  key: VueTypes.string,
  label: VueTypes.any
};

export default {
  name: 'SmSelectOptGroup',
  isSelectOptGroup: true,
  inheritAttrs: false,
  props: optGroupTypes,
  computed: {
    optGroupProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
    },
    optGroupListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(Select.OptGroup, {
      props: this.optGroupProps,
      on: this.optGroupListeners
    });
  }
};
</script>
