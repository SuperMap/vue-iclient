import Chart from './Chart';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

Chart.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(Chart.options ? Chart.options.name : Chart.name, Chart);
};

export default Chart;
