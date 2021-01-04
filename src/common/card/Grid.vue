<script lang="ts">
import Grid from 'ant-design-vue/es/card/Grid';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const gridTypes = {
  prefixCls: VueTypes.string,
  hoverable: VueTypes.bool
};

export default {
  name: 'SmCardGrid',
  __ANT_CARD_GRID: true,
  defaultComponent: Grid,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: gridTypes
};
</script>
