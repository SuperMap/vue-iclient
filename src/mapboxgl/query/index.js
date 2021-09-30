import Query from './Query';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Query.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Query.options ? Query.options.name : Query.name, Query);
};

export default Query;
