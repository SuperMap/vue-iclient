import EchartsLayer from './EchartsLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

EchartsLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(EchartsLayer.options ? EchartsLayer.options.name : EchartsLayer.name, EchartsLayer);
};

export default EchartsLayer;
