import Marker from './Marker';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Marker.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Marker.options ? Marker.options.name : Marker.name, Marker);
};

export default Marker;
