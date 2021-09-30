import FlyTo from './FlyTo';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

FlyTo.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(FlyTo.options ? FlyTo.options.name : FlyTo.name, FlyTo);
};

export default FlyTo;
