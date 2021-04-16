import Popup from './Popup';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Popup.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Popup.options ? Popup.options.name : Popup.name, Popup);
};

export default Popup;
