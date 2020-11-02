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
    }
  },
  render(): void {}
};
</script>
