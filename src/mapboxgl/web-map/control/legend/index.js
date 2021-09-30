import Legend from './Legend';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Legend.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Legend.options ? Legend.options.name : Legend.name, Legend);
};

export default Legend;
