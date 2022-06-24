import NcpMap from './NcpMap';
import init from 'vue-iclient/src/init';

NcpMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(NcpMap.options ? NcpMap.options.name : NcpMap.name, NcpMap);
};

export default NcpMap;
