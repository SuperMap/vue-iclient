import Query from './Query';
import init from 'vue-iclient/src/init';

Query.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Query.options ? Query.options.name : Query.name, Query);
};

export default Query;
