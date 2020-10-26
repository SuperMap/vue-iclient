<script lang="ts">
import { VNode } from 'vue';
import Select, { SelectProps } from 'ant-design-vue/es/select';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export const selectTypes = {
  ...SelectProps,
  showSearch: VueTypes.bool.def(false),
  transitionName: VueTypes.string.def('slide-up'),
  choiceTransitionName: VueTypes.string.def('zoom')
};

export default {
  name: 'SmSelect',
  components: {
    Select
  },
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
      return Object.assign(props, { prefixCls: 'sm-component-select', dropdownStyle: this.nextDropdownStyle });
    },
    selectStyle() {
      const style = {
        '--box-shadow-color': getColorWithOpacity(this.hoverColorData, 0.25),
        '--normal-bg-color': this.componentBackgroundData,
        '--normal-border-color': this.borderBaseColorData,
        '--focus-border-color': this.getColor(0)
      };
      if (this.disabled) {
        style['--disabled-text-color'] = getColorWithOpacity(this.textColorsData, 0.25);
        style['--disabled-border-color'] = this.disabledBorderColorData;
      }
      if (this.showArrow) {
        style['--arrow-text-color'] = getColorWithOpacity(this.textColorsData, 0.45);
      }
      return style;
    },
    nextDropdownStyle() {
      const style = {
        '--dropdown-bg-color': this.selectDropdownBackgroundData,
        '--dropdown-box-shadow': this.selectDropdownBoxshadowData,
        '--selected-bg-color': this.selectedColorData,
        '--selected-text-color': getColorWithOpacity(this.textColorsData, 1),
        '--disabled-text-color': getColorWithOpacity(this.textColorsData, 0.25),
        '--hover-bg-color': this.hoverColorData,
        '--group-title-text-color': getColorWithOpacity(this.textColorsData, 0.45)
      };
      return Object.assign({}, this.dropdownStyle, style);
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
        scopedSlots: this.$scopedSlots,
        style: this.selectStyle
      },
      this.$slots['default']
    );
  }
};
</script>
