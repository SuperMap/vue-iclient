<script lang="ts">
import Layout from 'ant-design-vue/es/layout';
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const layoutFooterTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayoutFooter',
  defaultComponent: Layout.Footer,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: layoutFooterTypes,
  computed: {
    extralProps() {
      return {
        tagName: 'footer'
      };
    }
  }
};
</script>
