import Iframe from './Iframe';
import init from 'vue-iclient/src/init';

Iframe.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Iframe.options ? Iframe.options.name : Iframe.name, Iframe);
};

export default Iframe;
