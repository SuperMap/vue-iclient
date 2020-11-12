<script lang="ts">
import Select from 'ant-design-vue/es/select';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const optGroupTypes = {
  key: VueTypes.string,
  label: VueTypes.any
};

export default {
  name: 'SmSelectOptGroup',
  isSelectOptGroup: true,
  defaultComponent: Select.OptGroup,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: optGroupTypes
};
</script>
