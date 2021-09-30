import GraphThemeLayer from './GraphThemeLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

GraphThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(GraphThemeLayer.options ? GraphThemeLayer.options.name : GraphThemeLayer.name, GraphThemeLayer);
};

export default GraphThemeLayer;
