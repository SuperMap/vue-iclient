<script lang="ts">
import Spin, { SpinProps } from 'ant-design-vue/es/spin/Spin';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

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
