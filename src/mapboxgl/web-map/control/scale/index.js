import Scale from './Scale';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Scale.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Scale.options ? Scale.options.name : Scale.name, Scale);
};

export default Scale;
