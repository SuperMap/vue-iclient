import TdtSearch from './TdtSearch';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

TdtSearch.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(TdtSearch.options ? TdtSearch.options.name : TdtSearch.name, TdtSearch);
};

export default TdtSearch;
