<script lang="ts">
import { VNode } from 'vue';
import Pagination from 'ant-design-vue/es/pagination/index';
import { PaginationProps } from 'ant-design-vue/es/pagination/Pagination';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const paginationTypes = {
  ...PaginationProps()
};

export default {
  name: 'SmPagination',
  mixins: [Theme],
  inheritAttrs: false,
  model: {
    prop: 'current',
    event: 'change.current'
  },
  props: paginationTypes,
  computed: {
    paginationProps() {
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: 'sm-component-pagination',
        selectPrefixCls: 'sm-component-select'
      });
    },
    paginationListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        'change.current': function(value) {
          vm.$emit('change.current', value);
        }
      });
    }
  },
  render(h): VNode {
    return h(
      Pagination,
      {
        props: this.paginationProps,
        on: this.paginationListeners,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
