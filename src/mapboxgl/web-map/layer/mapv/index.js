import MapvLayer from './MapvLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

MapvLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(MapvLayer.options ? MapvLayer.options.name : MapvLayer.name, MapvLayer);
};

export default MapvLayer;
