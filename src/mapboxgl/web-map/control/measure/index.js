import Measure from './Measure';
import init from 'vue-iclient/src/init';

Measure.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Measure.options ? Measure.options.name : Measure.name, Measure);
};

export default Measure;
