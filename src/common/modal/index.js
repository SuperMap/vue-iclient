import { default as Modal } from './main.ts';
import init from 'vue-iclient/src/init';

Modal.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Modal.options ? Modal.options.name : Modal.name, Modal);
};

export default Modal;
