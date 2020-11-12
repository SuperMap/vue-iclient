<script lang="ts">
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export default {
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change.value'
  },
  computed: {
    extralListeners() {
      const vm = this;
      return {
        // 这里确保组件配合 `v-model` 的工作
        'change.value': function(value) {
          vm.$emit('change.value', value);
        }
      };
    }
  }
};
</script>
