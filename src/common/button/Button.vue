<script lang="ts">
import Button from 'ant-design-vue/es/button/button';
import buttonProps from 'ant-design-vue/es/button/buttonTypes';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const buttonTypes = {
  ...buttonProps(),
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
};

export default {
  name: 'SmButton',
  __ANT_BUTTON: true,
  defaultComponent: Button,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: buttonTypes,
  computed: {
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-btn-md': this.size === 'middle'
      };
    }
  }
};
</script>
