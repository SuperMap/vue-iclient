<script lang="ts">
import Pagination from 'ant-design-vue/es/pagination/index';
import { PaginationProps } from 'ant-design-vue/es/pagination/Pagination';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const paginationTypes = {
  ...PaginationProps()
};

export default {
  name: 'SmPagination',
  defaultComponent: Pagination,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'current',
    event: 'change.current'
  },
  props: paginationTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        'change.current': function(value) {
          vm.$emit('change.current', value);
        }
      };
    }
  }
};
</script>
