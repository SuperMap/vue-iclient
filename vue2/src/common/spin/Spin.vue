<script lang="ts">
import Spin, { SpinProps } from 'ant-design-vue/es/spin/Spin';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const spinTypes = {
  ...SpinProps()
};

export default {
  name: 'SmSpin',
  defaultComponent: Spin,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: spinTypes
};
</script>
