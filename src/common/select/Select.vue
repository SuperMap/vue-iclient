<script lang="ts">
import Select, { SelectProps } from 'ant-design-vue/es/select';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const selectTypes = {
  ...SelectProps,
  showSearch: VueTypes.bool.def(false),
  transitionName: VueTypes.string.def('slide-up'),
  choiceTransitionName: VueTypes.string.def('zoom'),
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
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
        change: function(...args) {
          vm.$emit('change', ...args);
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
        'sm-component-select-md': this.size === 'middle'
      };
    }
  }
};
</script>
