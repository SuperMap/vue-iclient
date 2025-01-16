import GraphMap from './GraphMap';
import init from 'vue-iclient/src/init';

GraphMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(GraphMap.options ? GraphMap.options.name : GraphMap.name, GraphMap);
};

export default GraphMap;
