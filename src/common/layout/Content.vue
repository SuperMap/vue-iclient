<script lang="ts">
import Layout from 'ant-design-vue/es/layout';
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const layoutContentTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayoutContent',
  defaultComponent: Layout.Content,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: layoutContentTypes,
  computed: {
    extralProps() {
      return {
        tagName: 'main'
      };
    }
  }
};
</script>
