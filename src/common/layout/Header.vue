<script lang="ts">
import Layout from 'ant-design-vue/es/layout';
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const layoutHederTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayoutHeader',
  defaultComponent: Layout.Header,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: layoutHederTypes,
  computed: {
    extralProps() {
      return {
        tagName: 'header'
      };
    }
  }
};
</script>
