<script lang="ts">
import Meta from 'ant-design-vue/es/card/Meta';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

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
