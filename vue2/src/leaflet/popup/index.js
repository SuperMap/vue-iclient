import Popup from './Popup';
import init from 'vue-iclient/src/init';

Popup.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Popup.options ? Popup.options.name : Popup.name, Popup);
};

export default Popup;
