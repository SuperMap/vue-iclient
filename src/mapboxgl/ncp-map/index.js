import NcpMap from './NcpMap';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

NcpMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(NcpMap.options ? NcpMap.options.name : NcpMap.name, NcpMap);
};

export default NcpMap;
