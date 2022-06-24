import TimeText from './TimeText';
import init from 'vue-iclient/src/init';

TimeText.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TimeText.options ? TimeText.options.name : TimeText.name, TimeText);
};

export default TimeText;
