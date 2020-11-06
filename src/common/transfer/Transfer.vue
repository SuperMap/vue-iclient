<script lang="ts">
import Transfer from 'ant-design-vue/es/transfer';
import { VNode } from 'vue';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const transferTypes = {
  prefixCls: VueTypes.string,
  dataSource: VueTypes.array,
  disabled: VueTypes.boolean,
  targetKeys: VueTypes.arrayOf(VueTypes.string),
  selectedKeys: VueTypes.arrayOf(VueTypes.string),
  render: VueTypes.func,
  listStyle: VueTypes.oneOfType([VueTypes.func, VueTypes.object]),
  operationStyle: VueTypes.object,
  titles: VueTypes.arrayOf(VueTypes.string),
  operations: VueTypes.arrayOf(VueTypes.string),
  showSearch: VueTypes.bool,
  filterOption: VueTypes.func,
  searchPlaceholder: VueTypes.string,
  notFoundContent: VueTypes.any,
  locale: VueTypes.object,
  rowKey: VueTypes.func,
  lazy: VueTypes.oneOfType([VueTypes.object, VueTypes.bool]),
  showSelectAll: VueTypes.bool
};

export default {
  name: 'SmTransfer',
  mixins: [Theme],
  props: transferTypes,
  computed: {
    transferProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-transfer' });
    },
    transferListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    return h(
      Transfer,
      {
        props: this.transferProps,
        scopedSlots: this.$scopedSlots,
        on: this.transferListeners
      },
      this.$slots['default']
    );
  }
};
</script>
