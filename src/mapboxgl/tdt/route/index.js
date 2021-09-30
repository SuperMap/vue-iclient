import TdtRoute from './TdtRoute';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

TdtRoute.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(TdtRoute.options ? TdtRoute.options.name : TdtRoute.name, TdtRoute);
};

export default TdtRoute;
