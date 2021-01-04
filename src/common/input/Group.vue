<script lang="ts">
import Group from 'ant-design-vue/es/input/Group';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const inputGroupTypes = {
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  compact: VueTypes.bool
};

export default {
  name: 'SmInputGroup',
  defaultComponent: Group,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: inputGroupTypes
};
</script>
