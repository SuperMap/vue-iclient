import Group from './Group';
import Input from './Input';
import Password from './Password';
import Search from './Search';
import TextArea from './TextArea';
import init from 'vue-iclient/src/init';

Input.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Group.options ? Group.options.name : Group.name, Group);
  Vue.component(Input.options ? Input.options.name : Input.name, Input);
  Vue.component(Password.options ? Password.options.name : Password.name, Password);
  Vue.component(Search.options ? Search.options.name : Search.name, Search);
  Vue.component(TextArea.options ? TextArea.options.name : TextArea.name, TextArea);
};

export default Input;
