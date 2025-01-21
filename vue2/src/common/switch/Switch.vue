<script lang="ts">
import Switch from 'ant-design-vue/es/switch';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const switchTypes = {
  autoFocus: VueTypes.bool,
  defaultChecked: VueTypes.bool,
  checked: VueTypes.bool,
  checkedChildren: VueTypes.any,
  unCheckedChildren: VueTypes.any,
  size: VueTypes.oneOf(['small', 'large', 'default']).def('default'),
  disabled: VueTypes.bool,
  loading: VueTypes.bool
};

export default {
  name: 'SmSwitch',
  __ANT_SWITCH: true,
  defaultComponent: Switch,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: switchTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        // 这里确保组件配合 `v-model` 的工作
        'change.value': function(value) {
          vm.$emit('change.value', value);
        }
      };
    }
  }
};
</script>
