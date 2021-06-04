import Vue, { VNode, CreateElement } from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { getOptionProps } from 'ant-design-vue/es/_util/props-util';
// @ts-ignore
import { ConfigConsumerProps } from 'vue-iclient/src/common/config-provider/ConfigProvider.vue';
import LocaleReceiver from 'ant-design-vue/es/locale-provider/LocaleReceiver.js';

interface configProviderParams {
  getPopupContainer: Function;
  prefixCls: string;
  renderEmpty: Function;
  csp: Object;
  autoInsertSpaceInButton: boolean;
  locale: Object;
  pageHeader: Object;
  transformCellText: Function;
}
@Component
export default class BaseRender extends Vue {
  @Inject({
    default: () => {
      return ConfigConsumerProps;
    }
  })
  configProvider!: configProviderParams;

  @Inject({
    default: () => {
      return {
        antLocale: Vue.prototype.$i18n && Vue.prototype.$i18n.getLocaleMessage(Vue.prototype.$i18n.locale)
      };
    }
  })
  localeData;

  get extralProps() {
    return {};
  }

  get componentProps() {
    return { ...getOptionProps(this), ...this.extralProps };
  }

  get extralListeners() {
    return {};
  }

  get componentListeners() {
    return { ...this.$listeners, ...this.extralListeners };
  }

  get componentStyle() {
    return null;
  }

  get componentClass() {
    return null;
  }

  getPrefixCls(suffixCls: string, customizePrefixCls: string) {
    const { prefixCls = 'sm-component' } = this.$props;
    if (customizePrefixCls) return customizePrefixCls;
    return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  }

  getComponentInstance() {
    const Component = this.$options.defaultComponent;
    // @ts-ignore
    if (Component.inject && Component.inject.configProvider) {
      // @ts-ignore
      Component.inject.configProvider.default = this.configProvider;
      // @ts-ignore
    }
    LocaleReceiver.inject.localeData.default = this.configProvider.locale
      ? { ...this.localeData, ...this.configProvider.locale }
      : this.localeData;
    return Component;
  }

  renderChildren(createElement) {
    const slotComponents = [].concat(this.$slots.default || []);
    for (const key in this.$slots) {
      if (key !== 'default') {
        slotComponents.push(
          createElement(
            'template',
            {
              slot: key
            },
            this.$slots[key]
          )
        );
      }
    }
    return slotComponents;
  }

  render(h: CreateElement): VNode {
    const Component = this.getComponentInstance();
    return h(
      Component,
      {
        props: this.componentProps,
        style: this.componentStyle,
        class: this.componentClass,
        attrs: this.$attrs,
        on: this.componentListeners,
        scopedSlots: this.$scopedSlots
      },
      this.renderChildren(h)
    );
  }
}
