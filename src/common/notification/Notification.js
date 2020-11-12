import api from 'ant-design-vue/es/notification';

let copyOpen = api.open;

api.open = function(config) {
  let mergetConfig = Object.assign({}, config, { prefixCls: config.prefixCls || 'sm-component-notification' });
  copyOpen(mergetConfig);
};

export default api;
