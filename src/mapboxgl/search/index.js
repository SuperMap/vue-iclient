import Search from './Search';
import init from 'vue-iclient/src/init';

Search.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Search.options ? Search.options.name : Search.name, Search);
};

export default Search;
