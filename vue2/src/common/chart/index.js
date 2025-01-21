import ChartMixin from './ChartMixin';
import init from 'vue-iclient/src/init';

ChartMixin.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(ChartMixin.options ? ChartMixin.options.name : ChartMixin.name, ChartMixin);
};

export default ChartMixin;
