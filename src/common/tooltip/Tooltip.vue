<script lang="ts">
import Tooltip from 'ant-design-vue/es/tooltip/Tooltip';
import { VNode } from 'vue';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const tooltipTypes = {
  routes: VueTypes.array,
  params: VueTypes.object,
  separator: VueTypes.string,
  itemRender: VueTypes.func
};

export default {
  name: 'SmTooltip',
  mixins: [Theme],
  props: tooltipTypes,
  computed: {
    tooltipProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
    },
    tooltipListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(
      Tooltip,
      {
        props: this.tooltipProps,
        scopedSlots: this.$scopedSlots,
        on: this.tooltipListeners
      },
      this.$slots['default']
    );
  }
};
</script>
