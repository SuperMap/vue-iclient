import Checkbox from './Checkbox';
import Group from './Group';
import init from 'vue-iclient/src/init';

Checkbox.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Checkbox.options ? Checkbox.options.name : Checkbox.name, Checkbox);
  Vue.component(Group.options ? Group.options.name : Group.name, Group);
};

export default Checkbox;
