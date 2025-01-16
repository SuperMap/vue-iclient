import LabelThemeLayer from './LabelThemeLayer';
import init from 'vue-iclient/src/init';

LabelThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LabelThemeLayer.options ? LabelThemeLayer.options.name : LabelThemeLayer.name, LabelThemeLayer);
};

export default LabelThemeLayer;
