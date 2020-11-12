<script lang="ts">
import ButtonGroup, { ButtonGroupProps } from 'ant-design-vue/es/button/button-group';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const buttonGroupTypes = {
  ...ButtonGroupProps
};

export default {
  name: 'SmButtonGroup',
  defaultComponent: ButtonGroup,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: buttonGroupTypes
};
</script>
