import CoordinateConversion from './CoordinateConversion';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

CoordinateConversion.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(CoordinateConversion.options ? CoordinateConversion.options.name : CoordinateConversion.name, CoordinateConversion);
};

export default CoordinateConversion;
