<script lang="ts">
import Transfer, { TransferProps } from 'ant-design-vue/es/transfer';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const transferTypes = {
  ...TransferProps,
  showSearch: VueTypes.bool
};

export default {
  name: 'SmTransfer',
  defaultComponent: Transfer,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: transferTypes
};
</script>
