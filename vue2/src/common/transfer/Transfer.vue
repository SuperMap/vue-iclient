<script lang="ts">
import Transfer, { TransferProps } from 'ant-design-vue/es/transfer';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

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
