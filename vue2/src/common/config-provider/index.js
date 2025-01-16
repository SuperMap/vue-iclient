import ConfigProvider from './ConfigProvider';
import init from 'vue-iclient/src/init';

ConfigProvider.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(ConfigProvider.options ? ConfigProvider.options.name : ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider;
