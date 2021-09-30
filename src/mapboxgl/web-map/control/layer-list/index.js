import LayerList from './LayerList';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

LayerList.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(LayerList.options ? LayerList.options.name : LayerList.name, LayerList);
};

export default LayerList;
