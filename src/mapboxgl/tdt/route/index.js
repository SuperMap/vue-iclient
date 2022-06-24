import TdtRoute from './TdtRoute';
import init from 'vue-iclient/src/init';

TdtRoute.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TdtRoute.options ? TdtRoute.options.name : TdtRoute.name, TdtRoute);
};

export default TdtRoute;
