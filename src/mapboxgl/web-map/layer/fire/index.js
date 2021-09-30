import FireLayer from './FireLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

FireLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(FireLayer.options ? FireLayer.options.name : FireLayer.name, FireLayer);
};

export default FireLayer;
