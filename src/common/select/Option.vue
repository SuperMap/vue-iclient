<script lang="ts">
import Select from 'ant-design-vue/es/select';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

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
