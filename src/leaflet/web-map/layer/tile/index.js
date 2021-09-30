import TileLayer from './TileLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

TileLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(TileLayer.options ? TileLayer.options.name : TileLayer.name, TileLayer);
};

export default TileLayer;
