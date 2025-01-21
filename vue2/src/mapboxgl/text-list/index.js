import TextList from './TextList';
import init from 'vue-iclient/src/init';

TextList.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TextList.options ? TextList.options.name : TextList.name, TextList);
};

export default TextList;
