import Attributes from './Attributes';
import init from 'vue-iclient/src/init';

Attributes.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Attributes.options ? Attributes.options.name : Attributes.name, Attributes);
};

export default Attributes;
