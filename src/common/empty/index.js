import Empty from './Empty';
import init from 'vue-iclient/src/init';

Empty.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Empty.options ? Empty.options.name : Empty.name, Empty);
};

export default Empty;
