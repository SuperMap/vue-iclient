import RanksymbolThemeLayer from './RanksymbolThemeLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

RanksymbolThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(RanksymbolThemeLayer.options ? RanksymbolThemeLayer.options.name : RanksymbolThemeLayer.name, RanksymbolThemeLayer);
};

export default RanksymbolThemeLayer;
