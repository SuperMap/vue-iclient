import RangeThemeLayer from './RangeThemeLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

RangeThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(RangeThemeLayer.options ? RangeThemeLayer.options.name : RangeThemeLayer.name, RangeThemeLayer);
};

export default RangeThemeLayer;
