import HeatmapLayer from './HeatmapLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

HeatmapLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(HeatmapLayer.options ? HeatmapLayer.options.name : HeatmapLayer.name, HeatmapLayer);
};

export default HeatmapLayer;
