import Border from './Border';
import init from 'vue-iclient/src/init';

Border.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Border.options ? Border.options.name : Border.name, Border);
};

export default Border;
