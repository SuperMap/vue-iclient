<script lang="ts">
import { VNode } from 'vue';
import Select, { SelectProps } from 'ant-design-vue/es/select';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const selectTypes = {
  ...SelectProps,
  showSearch: VueTypes.bool.def(false),
  transitionName: VueTypes.string.def('slide-up'),
  choiceTransitionName: VueTypes.string.def('zoom')
};

export default {
  name: 'SmSelect',
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: selectTypes,
  computed: {
    selectProps() {
      const props = objectWithoutProperties({ ...this.$props, ...this.$attrs });
      return Object.assign(props, { prefixCls: 'sm-component-select' });
    },
    selectListeners() {
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
      Select,
      {
        props: this.selectProps,
        on: this.selectListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
