import Transfer from './Transfer';
import init from 'vue-iclient/src/init';

Transfer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Transfer.options ? Transfer.options.name : Transfer.name, Transfer);
};

export default Transfer;
