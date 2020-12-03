<script lang="ts">
import Column from 'ant-design-vue/es/table/Column';
import { ColumnProps } from 'ant-design-vue/es/table/interface';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const tableColumnTypes = {
  ...ColumnProps
};

export default {
  name: 'SmTableColumn',
  defaultComponent: Column,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: tableColumnTypes
};
</script>
