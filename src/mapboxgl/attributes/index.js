import Attributes from './Attributes';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Attributes.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Attributes.options ? Attributes.options.name : Attributes.name, Attributes);
};

export default Attributes;
