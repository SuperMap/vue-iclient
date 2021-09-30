import LayerSelect from './LayerSelect';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

LayerSelect.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(LayerSelect.options ? LayerSelect.options.name : LayerSelect.name, LayerSelect);
};

export default LayerSelect;
