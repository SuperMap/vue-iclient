import { CreateElement, VNode } from 'vue';
import Empty from 'ant-design-vue/es/empty';
import VueTypes from '../_utils/vue-types';
import defaultImage from './assets/image/empty.png';

const RenderEmpty = {
  functional: true,
  inject: {
    configProvider: { default: () => {} }
  },
  inheritAttrs: false,
  props: {
    componentName: VueTypes.string
  },
  render(h: CreateElement, context: any): VNode {
    const { props, injections } = context;
    function renderHtml(componentName: string) {
      const getPrefixCls = injections.configProvider.getPrefixCls;
      const locale = injections.configProvider.locale;
      const antLocale = locale || {};
      const localeData = antLocale['Empty'] || {};
      const prefix = getPrefixCls('empty');
      const props = {
        image: defaultImage,
        description: localeData.description,
        prefixCls: prefix || 'sm-component-empty'
      };
      switch (componentName) {
        case 'Select':
        case 'TreeSelect':
        case 'Cascader':
        case 'Transfer':
        case 'Mentions':
          return h(Empty, {
            props,
            class: `${prefix}-small`
          });
        default:
          return h(Empty, { props });
      }
    }
    return renderHtml(props.componentName);
  }
};

function renderEmpty(h: CreateElement, componentName: string) {
  return h(RenderEmpty, { props: { componentName } });
}

export default renderEmpty;
