import DrillMap from './DrillMap';
import init from 'vue-iclient/src/init';

DrillMap.install = function (Vue, opts) {
  init(Vue, opts);
  Vue.component(DrillMap.options ? DrillMap.options.name : DrillMap.name, DrillMap);
};

export default DrillMap;
