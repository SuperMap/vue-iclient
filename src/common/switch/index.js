import Switch from './Switch';
import init from 'vue-iclient/src/init';

Switch.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Switch.options ? Switch.options.name : Switch.name, Switch);
};

export default Switch;
