import DeckglLayer from './DeckglLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

DeckglLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(DeckglLayer.options ? DeckglLayer.options.name : DeckglLayer.name, DeckglLayer);
};

export default DeckglLayer;
