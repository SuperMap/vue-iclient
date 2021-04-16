import ClusterLayer from './ClusterLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

ClusterLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(ClusterLayer.options ? ClusterLayer.options.name : ClusterLayer.name, ClusterLayer);
};

export default ClusterLayer;
