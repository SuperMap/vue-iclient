<script lang="ts">
import Empty, { EmptyProps } from 'ant-design-vue/es/empty/index';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const emptyProps = {
  ...EmptyProps(),
  image: VueTypes.any.def(Empty.PRESENTED_IMAGE_SIMPLE)
};

export default {
  name: 'SmEmpty',
  defaultComponent: Empty,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: emptyProps,
  computed: {
    extralProps() {
      return {
        prefixCls: this.prefixCls || 'sm-component-empty'
      };
    }
  }
};
</script>
