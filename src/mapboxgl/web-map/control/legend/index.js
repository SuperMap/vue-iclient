import Legend from './Legend';
import init from 'vue-iclient/src/init';

Legend.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Legend.options ? Legend.options.name : Legend.name, Legend);
};

export default Legend;
