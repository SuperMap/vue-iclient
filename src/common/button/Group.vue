<script lang="ts">
import ButtonGroup, { ButtonGroupProps } from 'ant-design-vue/es/button/button-group';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const buttonGroupTypes = {
  ...ButtonGroupProps,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
};

export default {
  name: 'SmButtonGroup',
  defaultComponent: ButtonGroup,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: buttonGroupTypes,
  computed: {
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-btn-group-md': this.size === 'middle'
      };
    }
  }
};
</script>
