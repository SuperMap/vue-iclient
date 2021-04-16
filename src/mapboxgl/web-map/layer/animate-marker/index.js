import AnimateMarkerLayer from './AnimateMarkerLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

AnimateMarkerLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(AnimateMarkerLayer.options ? AnimateMarkerLayer.options.name : AnimateMarkerLayer.name, AnimateMarkerLayer);
};

export default AnimateMarkerLayer;
