import LabelThemeLayer from './LabelThemeLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

LabelThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(LabelThemeLayer.options ? LabelThemeLayer.options.name : LabelThemeLayer.name, LabelThemeLayer);
};

export default LabelThemeLayer;
