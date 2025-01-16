import Compare from './Compare';
import init from 'vue-iclient/src/init';

Compare.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Compare.options ? Compare.options.name : Compare.name, Compare);
};

export default Compare;
