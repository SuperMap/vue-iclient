import Pagination from './Pagination';
import init from 'vue-iclient/src/init';

Pagination.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Pagination.options ? Pagination.options.name : Pagination.name, Pagination);
};

export default Pagination;
