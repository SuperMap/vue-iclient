import WebMap from './WebMap';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

WebMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(WebMap.options ? WebMap.options.name : WebMap.name, WebMap);
};

export default WebMap;
