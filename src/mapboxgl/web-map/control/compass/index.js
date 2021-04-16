import Compass from './Compass';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Compass.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Compass.options ? Compass.options.name : Compass.name, Compass);
};

export default Compass;
