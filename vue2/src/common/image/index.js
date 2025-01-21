import Image from './Image';
import init from 'vue-iclient/src/init';

Image.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Image.options ? Image.options.name : Image.name, Image);
};

export default Image;
