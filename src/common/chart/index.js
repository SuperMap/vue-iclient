import ChartMixin from './ChartMixin';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

ChartMixin.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(ChartMixin.options ? ChartMixin.options.name : ChartMixin.name, ChartMixin);
};

export default ChartMixin;
