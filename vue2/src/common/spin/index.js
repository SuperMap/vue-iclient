import { default as Spin } from './main.ts';
import init from 'vue-iclient/src/init';

Spin.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Spin.options ? Spin.options.name : Spin.name, Spin);
};

export default Spin;
