<script lang="ts">
import Table from 'ant-design-vue/es/table';
import { TableProps } from 'ant-design-vue/es/table/interface';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

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
