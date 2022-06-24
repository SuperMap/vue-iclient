import TdtMapSwitcher from './TdtMapSwitcher';
import init from 'vue-iclient/src/init';

TdtMapSwitcher.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TdtMapSwitcher.options ? TdtMapSwitcher.options.name : TdtMapSwitcher.name, TdtMapSwitcher);
};

export default TdtMapSwitcher;
