import UniqueThemeLayer from './UniqueThemeLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

UniqueThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(UniqueThemeLayer.options ? UniqueThemeLayer.options.name : UniqueThemeLayer.name, UniqueThemeLayer);
};

export default UniqueThemeLayer;
