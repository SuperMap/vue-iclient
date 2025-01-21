import Column from './Column';
import ColumnGroup from './ColumnGroup';
import Table from './Table';
import init from 'vue-iclient/src/init';

Table.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Column.options ? Column.options.name : Column.name, Column);
  Vue.component(ColumnGroup.options ? ColumnGroup.options.name : ColumnGroup.name, ColumnGroup);
  Vue.component(Table.options ? Table.options.name : Table.name, Table);
};

export default Table;
