import Identify from './Identify';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Identify.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Identify.options ? Identify.options.name : Identify.name, Identify);
};

export default Identify;
