import FillExtrusion from './FillExtrusion';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

FillExtrusion.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(FillExtrusion.options ? FillExtrusion.options.name : FillExtrusion.name, FillExtrusion);
};

export default FillExtrusion;
