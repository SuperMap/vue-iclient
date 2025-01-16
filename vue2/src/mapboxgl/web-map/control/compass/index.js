import Compass from './Compass';
import init from 'vue-iclient/src/init';

Compass.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Compass.options ? Compass.options.name : Compass.name, Compass);
};

export default Compass;
