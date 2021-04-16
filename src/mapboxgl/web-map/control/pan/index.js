import Pan from './Pan';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Pan.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Pan.options ? Pan.options.name : Pan.name, Pan);
};

export default Pan;
