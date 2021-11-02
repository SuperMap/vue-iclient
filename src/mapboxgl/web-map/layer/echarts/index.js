import EchartsLayer from './EchartsLayer';
import init from 'vue-iclient/src/init';

EchartsLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(EchartsLayer.options ? EchartsLayer.options.name : EchartsLayer.name, EchartsLayer);
};

export default EchartsLayer;
