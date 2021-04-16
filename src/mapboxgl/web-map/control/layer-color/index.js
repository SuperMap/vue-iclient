import LayerColor from './LayerColor';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

LayerColor.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(LayerColor.options ? LayerColor.options.name : LayerColor.name, LayerColor);
};

export default LayerColor;
