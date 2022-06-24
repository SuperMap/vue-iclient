import Chart from './Chart';
import init from 'vue-iclient/src/init';

Chart.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(Chart.options ? Chart.options.name : Chart.name, Chart);
};

export default Chart;
