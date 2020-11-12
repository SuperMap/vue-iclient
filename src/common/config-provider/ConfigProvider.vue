<script lang="ts">
import { VNode } from 'vue';
import ConfigProvider from 'ant-design-vue/es/config-provider';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import enUS from 'ant-design-vue/es/locale/en_US';
import VueTypes from '../_utils/vue-types';
import { objectWithoutProperties } from '../_utils/util';
import { getLanguage } from '../../common/_lang';

export const configProviderTypes = {
  getPopupContainer: VueTypes.func,
  prefixCls: VueTypes.string,
  renderEmpty: VueTypes.func,
  csp: VueTypes.object,
  autoInsertSpaceInButton: VueTypes.bool,
  locale: VueTypes.object,
  pageHeader: VueTypes.object,
  transformCellText: VueTypes.func
};

const ANTD_LOCALES = {
  zh_CN: zhCN,
  en_US: enUS
};

export default {
  name: 'SmConfigProvider',
  inheritAttrs: false,
  computed: {
    configProviderProps() {
      const antdLanguage = this.getAntdLanguage();
      return objectWithoutProperties({
        ...this.$props,
        ...this.$attrs,
        prefixCls: this.prefixCls || 'sm-component',
        locale: ANTD_LOCALES[antdLanguage]
      });
    }
  },
  methods: {
    getAntdLanguage() {
      let lang = getLanguage();
      if (lang === 'zh') {
        return 'zh_CN';
      } else if (lang === 'en') {
        return 'en_US';
      }
      return lang;
    }
  },
  render(h): VNode {
    return h(
      ConfigProvider,
      {
        props: this.configProviderProps,
        scopedSlots: this.$scopedSlots
      },
      this.$slots['default']
    );
  }
};
</script>
