import Dropdown from './Dropdown';
import init from 'vue-iclient/src/init';

Dropdown.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Dropdown.options ? Dropdown.options.name : Dropdown.name, Dropdown);
};

export default Dropdown;
