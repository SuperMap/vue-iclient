<script lang="ts">
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
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
      const vm = this;
      return Object.assign({}, this.$listeners, {
        'change': function(value) {
          vm.$emit('change', value);
        }
      });
    }
  },
  render(): void {}
};
</script>
