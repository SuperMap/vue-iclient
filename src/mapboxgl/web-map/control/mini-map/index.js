import MiniMap from './MiniMap';
import init from 'vue-iclient/src/init';

MiniMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(MiniMap.options ? MiniMap.options.name : MiniMap.name, MiniMap);
};

export default MiniMap;
