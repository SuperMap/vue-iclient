import Icon from './Icon';
import init from 'vue-iclient/src/init';

Icon.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Icon.options ? Icon.options.name : Icon.name, Icon);
};

export default Icon;
