import TablePopup from './TablePopup';
import init from 'vue-iclient/src/init';

TablePopup.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TablePopup.options ? TablePopup.options.name : TablePopup.name, TablePopup);
};

export default TablePopup;
