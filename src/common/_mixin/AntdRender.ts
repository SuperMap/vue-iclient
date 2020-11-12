import Vue, { VNode, CreateElement } from 'vue';
import { Component, Prop, Provide } from 'vue-property-decorator';
import defaultRenderEmpty from 'ant-design-vue/es/config-provider/renderEmpty';
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
    ...this.$props,
    getPrefixCls: this.getPrefixCls,
    renderEmpty: this.renderEmptyComponent
  };

  @Provide('localeData')
  localeData = {
    antLocale: Object.assign({}, this.locale || this.$i18n.getLocaleMessage(this.$i18n.locale), { exist: true })
  }

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

  renderChildren() {
    return this.$slots['default'];
  }

  render(h: CreateElement): VNode {
    const Component = this.getComponentInstance();
    return h(
      Component,
      {
        props: this.componentProps,
        attrs: this.$attrs,
        on: this.componentListeners,
        scopedSlots: this.$scopedSlots
      },
      this.renderChildren()
    );
  }
}
