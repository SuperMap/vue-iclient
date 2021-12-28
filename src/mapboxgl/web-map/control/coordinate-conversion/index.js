import CoordinateConversion from './CoordinateConversion';
import init from 'vue-iclient/src/init';

CoordinateConversion.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(CoordinateConversion.options ? CoordinateConversion.options.name : CoordinateConversion.name, CoordinateConversion);
};

export default CoordinateConversion;
