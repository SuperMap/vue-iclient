import TimeLine from './TimeLine';
import init from 'vue-iclient/src/init';

TimeLine.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TimeLine.options ? TimeLine.options.name : TimeLine.name, TimeLine);
};

export default TimeLine;
