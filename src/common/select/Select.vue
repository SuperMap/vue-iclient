<script lang="ts">
import Select, { SelectProps } from 'ant-design-vue/es/select';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const selectTypes = {
  ...SelectProps,
  showSearch: VueTypes.bool.def(false),
  transitionName: VueTypes.string.def('slide-up'),
  choiceTransitionName: VueTypes.string.def('zoom')
};

export default {
  name: 'SmSelect',
  defaultComponent: Select,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: selectTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        change: function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
