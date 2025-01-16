import Identify from './Identify';
import init from 'vue-iclient/src/init';

Identify.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Identify.options ? Identify.options.name : Identify.name, Identify);
};

export default Identify;
