<script lang="ts">
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  computed: {
    datePickerProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: 'sm-component-calendar',
        inputPrefixCls: 'sm-component-input'
      });
    },
    datePickerListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(): void {}
};
</script>
