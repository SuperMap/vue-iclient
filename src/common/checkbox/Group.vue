<script lang="ts">
import Group from 'ant-design-vue/es/checkbox/Group';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const groupTypes = {
  name: VueTypes.string,
  defaultValue: VueTypes.array,
  value: VueTypes.array,
  options: VueTypes.array,
  disabled: VueTypes.bool
};

export default {
  name: 'SmCheckboxGroup',
  defaultComponent: Group,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: groupTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        change: function(value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
