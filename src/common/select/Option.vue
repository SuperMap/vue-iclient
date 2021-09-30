<script lang="ts">
import Select from 'ant-design-vue/es/select';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const optionTypes = {
  disabled: VueTypes.bool,
  key: VueTypes.string,
  title: VueTypes.string,
  value: VueTypes.oneOfType([VueTypes.string, VueTypes.number])
};

export default {
  name: 'SmSelectOption',
  isSelectOption: true,
  defaultComponent: Select.Option,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: optionTypes
};
</script>
