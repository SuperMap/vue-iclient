import Button from './Button';
import Group from './Group';
import init from 'vue-iclient/src/init';

Button.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Button.options ? Button.options.name : Button.name, Button);
  Vue.component(Group.options ? Group.options.name : Group.name, Group);
};

export default Button;
