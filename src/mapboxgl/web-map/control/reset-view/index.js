import ResetView from './ResetView';
import init from 'vue-iclient/src/init';

ResetView.install = function (Vue, opts) {
  init(Vue, opts);
  Vue.component(ResetView.options ? ResetView.options.name : ResetView.name, ResetView);
};

export default ResetView;
