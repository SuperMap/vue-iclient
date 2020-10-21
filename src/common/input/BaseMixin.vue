<script lang="ts">
import Theme from '../_mixin/theme';
import { objectWithoutProperties, getColorWithOpacity } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  data() {
    return {
      inputValue: ''
    };
  },
  computed: {
    inputProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, value: this.inputValue });
    },
    inputStyle() {
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
      return style;
    },
    inputListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        // 这里确保组件配合 `v-model` 的工作
        'change.value': function(value) {
          vm.inputValue = value;
          vm.$emit('change.value', value);
        }
      });
    }
  },
  watch: {
    value: {
      handler() {
        this.inputValue = this.value;
      },
      immediate: true
    }
  },
  render(): void {}
};
</script>
