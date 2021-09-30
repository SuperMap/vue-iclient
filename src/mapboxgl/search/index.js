import Search from './Search';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Search.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Search.options ? Search.options.name : Search.name, Search);
};

export default Search;
