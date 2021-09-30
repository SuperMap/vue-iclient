import Measure from './Measure';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Measure.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Measure.options ? Measure.options.name : Measure.name, Measure);
};

export default Measure;
