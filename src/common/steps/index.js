import Step from './Step';
import Steps from './Steps';
import init from 'vue-iclient/src/init';

Steps.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Step.options ? Step.options.name : Step.name, Step);
  Vue.component(Steps.options ? Steps.options.name : Steps.name, Steps);
};

export default Steps;
