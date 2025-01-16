import Button from './Button';
import Group from './Group';
import Radio from './Radio';
import init from 'vue-iclient/src/init';

Radio.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Button.options ? Button.options.name : Button.name, Button);
  Vue.component(Group.options ? Group.options.name : Group.name, Group);
  Vue.component(Radio.options ? Radio.options.name : Radio.name, Radio);
};

export default Radio;
