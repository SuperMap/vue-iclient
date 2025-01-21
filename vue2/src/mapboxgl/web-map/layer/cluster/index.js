import ClusterLayer from './ClusterLayer';
import init from 'vue-iclient/src/init';

ClusterLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(ClusterLayer.options ? ClusterLayer.options.name : ClusterLayer.name, ClusterLayer);
};

export default ClusterLayer;
