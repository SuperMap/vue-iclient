<script lang="ts">
import Meta from 'ant-design-vue/es/card/Meta';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const metaTypes = {
  prefixCls: VueTypes.string,
  title: VueTypes.any,
  description: VueTypes.any
};

export default {
  name: 'SmCardMeta',
  defaultComponent: Meta,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: metaTypes
};
</script>
