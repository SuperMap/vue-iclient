import Pan from './Pan';
import init from 'vue-iclient/src/init';

Pan.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Pan.options ? Pan.options.name : Pan.name, Pan);
};

export default Pan;
