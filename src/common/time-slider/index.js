import TimeSlider from './TimeSlider';
import init from 'vue-iclient/src/init';

TimeSlider.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TimeSlider.options ? TimeSlider.options.name : TimeSlider.name, TimeSlider);
};

export default TimeSlider;
