import Slider from './Slider';
import init from 'vue-iclient/src/init';

Slider.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Slider.options ? Slider.options.name : Slider.name, Slider);
};

export default Slider;
