import UniqueThemeLayer from './UniqueThemeLayer';
import init from 'vue-iclient/src/init';

UniqueThemeLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(UniqueThemeLayer.options ? UniqueThemeLayer.options.name : UniqueThemeLayer.name, UniqueThemeLayer);
};

export default UniqueThemeLayer;
