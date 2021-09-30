<script lang="ts">
import Table from 'ant-design-vue/es/table';
import { TableProps } from 'ant-design-vue/es/table/interface';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const tableTypes = {
  ...TableProps
};

export default {
  name: 'SmTable',
  defaultComponent: Table,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: tableTypes
};
</script>
