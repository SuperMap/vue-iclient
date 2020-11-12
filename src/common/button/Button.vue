<script lang="ts">
import Button from 'ant-design-vue/es/button/button';
import buttonProps from 'ant-design-vue/es/button/buttonTypes';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const buttonTypes = {
  ...buttonProps()
};

export default {
  name: 'SmButton',
  __ANT_BUTTON: true,
  defaultComponent: Button,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: buttonTypes
};
</script>
