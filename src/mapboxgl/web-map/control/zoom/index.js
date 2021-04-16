import Zoom from './Zoom';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Zoom.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Zoom.options ? Zoom.options.name : Zoom.name, Zoom);
};

export default Zoom;
