import VectorTileLayer from './VectorTileLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

VectorTileLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(VectorTileLayer.options ? VectorTileLayer.options.name : VectorTileLayer.name, VectorTileLayer);
};

export default VectorTileLayer;
