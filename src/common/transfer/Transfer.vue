<script lang="ts">
import Transfer, { TransferProps } from 'ant-design-vue/es/transfer';
import { VNode } from 'vue';
import VueTypes from '../_utils/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const transferTypes = {
  ...TransferProps,
  showSearch: VueTypes.bool
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
  mounted() {
    const replaceComponentClassNames = [
      '.sm-component-transfer-operation>.ant-btn',
      '.sm-component-transfer-list-content-item .ant-checkbox-wrapper',
      '.sm-component-transfer-list-content-item .ant-checkbox',
      '.sm-component-transfer-list-content-item .ant-checkbox-input',
      '.sm-component-transfer-list-content-item .ant-checkbox-inner',
      '.sm-component-transfer-list-body-search-wrapper .ant-input',
      '.sm-component-transfer-list-header .ant-checkbox-wrapper',
      '.sm-component-transfer-list-header .ant-checkbox',
      '.sm-component-transfer-list-header .ant-checkbox-input',
      '.sm-component-transfer-list-header .ant-checkbox-inner'
    ];
    this.$nextTick(() => {
      replaceComponentClassNames.forEach((name) => {
        this.replaceSubComponentClass(name);
      });
    });
  },
  methods: {
    replaceSubComponentClass(className): void {
      this.$nextTick(() => {
        const addonComponents = this.$el.querySelectorAll(className);
        if (!addonComponents) {
          return;
        }
        this.replace(addonComponents);
      });
    },
    replace(addonComponents) {
      addonComponents.forEach(addonComponent => {
        const classReplacer = addonComponent.className.replace(/ant-/gi, 'sm-component-');
        addonComponent.setAttribute('class', classReplacer);
      });
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
