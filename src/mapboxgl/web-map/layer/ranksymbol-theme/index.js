import RanksymbolThemeLayer from './RanksymbolThemeLayer';
import init from 'vue-iclient/src/init';

RanksymbolThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(RanksymbolThemeLayer.options ? RanksymbolThemeLayer.options.name : RanksymbolThemeLayer.name, RanksymbolThemeLayer);
};

export default RanksymbolThemeLayer;
