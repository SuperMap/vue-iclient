import TimePicker from './TimePicker';
import init from 'vue-iclient/src/init';

TimePicker.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TimePicker.options ? TimePicker.options.name : TimePicker.name, TimePicker);
};

export default TimePicker;
