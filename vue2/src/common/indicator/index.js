import CountTo from './CountTo';
import Indicator from './Indicator';
import init from 'vue-iclient/src/init';

Indicator.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(CountTo.options ? CountTo.options.name : CountTo.name, CountTo);
  Vue.component(Indicator.options ? Indicator.options.name : Indicator.name, Indicator);
};

export default Indicator;
