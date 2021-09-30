import MiniMap from './MiniMap';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

MiniMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(MiniMap.options ? MiniMap.options.name : MiniMap.name, MiniMap);
};

export default MiniMap;
