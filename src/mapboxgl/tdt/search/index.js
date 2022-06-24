import TdtSearch from './TdtSearch';
import init from 'vue-iclient/src/init';

TdtSearch.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TdtSearch.options ? TdtSearch.options.name : TdtSearch.name, TdtSearch);
};

export default TdtSearch;
