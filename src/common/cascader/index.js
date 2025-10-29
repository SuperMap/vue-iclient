import Cascader from './Cascader';
import init from 'vue-iclient/src/init';

Cascader.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Cascader.options ? Cascader.options.name : Cascader.name, Cascader);
};

export default Cascader;
