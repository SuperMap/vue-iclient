import TimeRange from './TimeRange';
import init from 'vue-iclient/src/init';

TimeRange.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TimeRange.options ? TimeRange.options.name : TimeRange.name, TimeRange);
};

export default TimeRange;
