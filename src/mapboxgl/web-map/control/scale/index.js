import Scale from './Scale';
import init from 'vue-iclient/src/init';

Scale.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Scale.options ? Scale.options.name : Scale.name, Scale);
};

export default Scale;
