<script lang="ts">
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export default {
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  computed: {
    extralListeners() {
      const vm = this;
      return {
        'change': function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
