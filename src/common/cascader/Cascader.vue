<script lang="ts">
import Cascader from 'ant-design-vue/es/cascader';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const cascaderProps = Cascader.props;

export default {
  name: 'SmCascader',
  defaultComponent: Cascader,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: cascaderProps
};
</script>
