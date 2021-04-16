import FillExtrusionLayer from './FillExtrusionLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

FillExtrusionLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(FillExtrusionLayer.options ? FillExtrusionLayer.options.name : FillExtrusionLayer.name, FillExtrusionLayer);
};

export default FillExtrusionLayer;
