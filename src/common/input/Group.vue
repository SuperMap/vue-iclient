<script lang="ts">
import Group from 'ant-design-vue/es/input/Group';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const inputGroupTypes = {
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle']).def('default'),
  compact: VueTypes.bool
};

export default {
  name: 'SmInputGroup',
  defaultComponent: Group,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: inputGroupTypes,
  computed: {
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-input-group-md': this.size === 'middle'
      };
    }
  }
};
</script>
