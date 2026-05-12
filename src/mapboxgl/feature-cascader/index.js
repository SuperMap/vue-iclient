import FeatureCascader from './FeatureCascader';
import init from 'vue-iclient/src/init';

FeatureCascader.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(FeatureCascader.options ? FeatureCascader.options.name : FeatureCascader.name, FeatureCascader);
};

export default FeatureCascader;
