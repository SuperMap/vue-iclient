import Slideshow from './Slideshow';
import SlideshowItem from './SlideshowItem';
import init from 'vue-iclient/src/init';

Slideshow.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Slideshow.options ? Slideshow.options.name : Slideshow.name, Slideshow);
  Vue.component(SlideshowItem.options ? SlideshowItem.options.name : SlideshowItem.name, SlideshowItem);
};

export default Slideshow;
