import RangeThemeLayer from './RangeThemeLayer';
import init from 'vue-iclient/src/init';

RangeThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(RangeThemeLayer.options ? RangeThemeLayer.options.name : RangeThemeLayer.name, RangeThemeLayer);
};

export default RangeThemeLayer;
