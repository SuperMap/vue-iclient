import Text from './Text';
import init from 'vue-iclient/src/init';

Text.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Text.options ? Text.options.name : Text.name, Text);
};

export default Text;
