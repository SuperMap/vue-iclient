<script lang="ts">
import ColumnGroup from 'ant-design-vue/es/table/ColumnGroup';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

export const tableColumnGroupTypes = {
  title: VueTypes.any
};

export default {
  name: 'SmTableColumnGroup',
  __ANT_TABLE_COLUMN_GROUP: true,
  defaultComponent: ColumnGroup,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: tableColumnGroupTypes
};
</script>
