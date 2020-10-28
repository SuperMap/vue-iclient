<script lang="ts">
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  computed: {
    checkboxProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: 'sm-component-checkbox'
      });
    },
    checkboxStyle() {
      const style = {
        '--normal-bg-color': this.componentBackgroundData,
        '--normal-border-color': this.borderBaseColorData,
        '--hover-border-color': this.hoverColorData
      };
      if (this.disabled) {
        style['--disabled-border-color'] = this.disabledBorderColorData;
      }
      return style;
    }
  },
  render(): void {}
};
</script>
