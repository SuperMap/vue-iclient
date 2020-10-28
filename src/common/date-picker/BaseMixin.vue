<script lang="ts">
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  computed: {
    datePickerProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        popupStyle: this.nextPopupStyle,
        prefixCls: 'sm-component-calendar',
        inputPrefixCls: 'sm-component-input'
      });
    },
    datePickerStyle() {
      const style = {
        '--box-shadow-color': getColorWithOpacity(this.hoverColorData, 0.25),
        '--normal-bg-color': this.componentBackgroundData,
        '--normal-border-color': this.borderBaseColorData,
        '--focus-border-color': this.getColor(0),
        '--icon-text-color': this.disabledTextColorData,
        '--icon-bg-color': getColorWithOpacity(this.backgroundData, 1)
      };
      if (this.disabled) {
        style['--disabled-border-color'] = this.disabledBorderColorData;
      }
      return style;
    },
    nextPopupStyle() {
      const style = {
        '--dropdown-bg-color': this.selectDropdownBackgroundData,
        '--dropdown-box-shadow': this.selectDropdownBoxshadowData,
        '--disabled-border-color': this.disabledBorderColorData,
        '--selected-year-month-color': getColorWithOpacity(this.textColorsData, 0.85),
        '--selected-text-color': getColorWithOpacity(this.textColorsData, 1),
        '--selected-bg-color': this.selectedColorData,
        '--date-hover-color': this.hoverColorData,
        '--date-active-color': this.getColor(0),
        '--normal-text-color': this.textColorsData
      };
      return Object.assign({}, this.popupStyle, style);
    },
    datePickerListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(): void {}
};
</script>
