import api from 'ant-design-vue/es/message';

const defaultPrefixCls = 'sm-component-message';
const configCallback = api.config;
configCallback({ prefixCls: defaultPrefixCls });
api.config = function(options) {
  if (options.prefixCls && options.prefixCls !== defaultPrefixCls) {
    api.destroy();
  }
  configCallback({ ...options, prefixCls: options.prefixCls || defaultPrefixCls });
};
export default api;
