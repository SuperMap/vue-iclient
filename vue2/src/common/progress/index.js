import Progress from './Progress';
import init from 'vue-iclient/src/init';

Progress.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Progress.options ? Progress.options.name : Progress.name, Progress);
};

export default Progress;
