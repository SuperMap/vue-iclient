import LayerManager from './LayerManager';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

LayerManager.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(LayerManager.options ? LayerManager.options.name : LayerManager.name, LayerManager);
};

export default LayerManager;
