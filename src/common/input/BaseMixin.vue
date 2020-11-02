<script lang="ts">
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export default {
  mixins: [Theme],
  inheritAttrs: false,
  computed: {
    inputProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs });
    },
    inputListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        // 这里确保组件配合 `v-model` 的工作
        'change.value': function(value) {
          vm.$emit('change.value', value);
        }
      });
    }
  },
  render(): void {}
};
</script>
