import DataFlowLayer from './DataFlowLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

DataFlowLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(DataFlowLayer.options ? DataFlowLayer.options.name : DataFlowLayer.name, DataFlowLayer);
};

export default DataFlowLayer;
