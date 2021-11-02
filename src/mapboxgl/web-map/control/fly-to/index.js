import FlyTo from './FlyTo';
import init from 'vue-iclient/src/init';

FlyTo.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(FlyTo.options ? FlyTo.options.name : FlyTo.name, FlyTo);
};

export default FlyTo;
