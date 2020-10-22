<script lang="ts">
import { VNode } from 'vue';
import Select from 'ant-design-vue/es/select';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export const selectTypes = {
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  showAction: VueTypes.oneOfType([VueTypes.string, VueTypes.arrayOf(String)]),
  notFoundContent: VueTypes.any,
  transitionName: VueTypes.string,
  choiceTransitionName: VueTypes.string,
  showSearch: VueTypes.bool,
  allowClear: VueTypes.bool,
  disabled: VueTypes.bool,
  placeholder: VueTypes.any,
  defaultActiveFirstOption: VueTypes.bool.def(true),
  dropdownClassName: VueTypes.string,
  dropdownStyle: VueTypes.object,
  dropdownMenuStyle: VueTypes.object,
  dropdownMatchSelectWidth: VueTypes.bool.def(true),
  filterOption: VueTypes.oneOfType([VueTypes.bool, VueTypes.func]),
  autoFocus: VueTypes.bool,
  backfill: VueTypes.bool,
  showArrow: VueTypes.bool.def(true),
  getPopupContainer: VueTypes.func,
  defaultOpen: VueTypes.bool,
  autoClearSearchValue: VueTypes.bool.def(true),
  dropdownRender: VueTypes.func,
  loading: VueTypes.bool,
  labelInValue: VueTypes.bool,
  maxTagCount: VueTypes.number,
  maxTagTextLength: VueTypes.number,
  maxTagPlaceholder: VueTypes.any,
  optionFilterProp: VueTypes.string.def('value'),
  optionLabelProp: VueTypes.string,
  mode: VueTypes.oneOf(['default', 'multiple', 'tags']).def('default'),
  defaultValue: VueTypes.oneOfType([
    VueTypes.string,
    VueTypes.arrayOf(String),
    VueTypes.number,
    VueTypes.arrayOf(Number)
  ]),
  // 定义这两个变量 显示不正确
  // open: VueTypes.bool,
  // value: VueTypes.oneOfType([VueTypes.string, VueTypes.arrayOf(String), VueTypes.number, VueTypes.arrayOf(Number)]),
  firstActiveValue: VueTypes.oneOfType([VueTypes.string, VueTypes.arrayOf(String)]),
  suffixIcon: VueTypes.any,
  removeIcon: VueTypes.any,
  clearIcon: VueTypes.any,
  menuItemSelectedIcon: VueTypes.any,
  tokenSeparators: VueTypes.arrayOf(String),
  options: VueTypes.array.def(undefined)
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
