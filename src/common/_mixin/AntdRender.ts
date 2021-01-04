import Vue, { VNode, CreateElement } from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import defaultRenderEmpty from '../empty/RenderEmpty';
import { getOptionProps, getComponentFromProp } from 'ant-design-vue/es/_util/props-util';

@Component
export default class BaseRender extends Vue {
  @Prop() getPopupContainer: Function;
  @Prop() prefixCls: string;
  @Prop() renderEmpty: Function;
  @Prop() csp: Object;
  @Prop() autoInsertSpaceInButton: boolean;
  @Prop() locale: Object;
  @Prop() pageHeader: Object;
  @Prop() transformCellText: Function;

  @Provide('configProvider')
  configProvider = {
    getPopupContainer: this.getPopupContainer,
    prefixCls: this.prefixCls,
    csp: this.csp,
    autoInsertSpaceInButton: this.autoInsertSpaceInButton,
    locale: Object.assign({}, this.locale, this.$i18n && this.$i18n.getLocaleMessage(this.$i18n.locale)),
    pageHeader: this.pageHeader,
    pageHeatransformCellTextder: this.transformCellText,
    getPrefixCls: this.getPrefixCls,
    renderEmpty: this.renderEmptyComponent
  };

  @Provide('localeData')
  localeData = {
    antLocale: Object.assign({}, this.locale, this.$i18n && this.$i18n.getLocaleMessage(this.$i18n.locale), { exist: true })
  };

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

  getPrefixCls(suffixCls: string, customizePrefixCls: string) {
    const { prefixCls = 'sm-component' } = this.$props;
    if (customizePrefixCls) return customizePrefixCls;
    return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  }

  renderEmptyComponent(h: CreateElement, name: string) {
    const renderEmpty = getComponentFromProp(this, 'renderEmpty', {}, false) || defaultRenderEmpty;
    return renderEmpty(h, name);
  }

  getComponentInstance() {
    const Component = this.$options.defaultComponent;
    return Component;
  }

  renderChildren(createElement) {
    const slotComponents = [].concat(this.$slots['default'] || []);
    for (let key in this.$slots) {
      if (key !== 'default') {
        slotComponents.push(
          createElement('template', {
            slot: key
          }, this.$slots[key])
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
        attrs: this.$attrs,
        on: this.componentListeners,
        scopedSlots: this.$scopedSlots
      },
      this.renderChildren(h)
    );
  }
}
