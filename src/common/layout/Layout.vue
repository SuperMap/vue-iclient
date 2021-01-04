<script lang="ts">
import Layout from 'ant-design-vue/es/layout';
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const layoutTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayout',
  defaultComponent: Layout,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: layoutTypes,
  computed: {
    extralProps() {
      return {
        tagName: 'section'
      };
    }
  }
};
</script>
