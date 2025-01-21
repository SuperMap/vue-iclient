<script lang="ts">
import Select from 'ant-design-vue/es/select';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

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
