import TdtMapSwitcher from './TdtMapSwitcher';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

TdtMapSwitcher.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(TdtMapSwitcher.options ? TdtMapSwitcher.options.name : TdtMapSwitcher.name, TdtMapSwitcher);
};

export default TdtMapSwitcher;
