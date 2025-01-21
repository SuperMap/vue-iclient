import DataFlowLayer from './DataFlowLayer';
import init from 'vue-iclient/src/init';

DataFlowLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(DataFlowLayer.options ? DataFlowLayer.options.name : DataFlowLayer.name, DataFlowLayer);
};

export default DataFlowLayer;
