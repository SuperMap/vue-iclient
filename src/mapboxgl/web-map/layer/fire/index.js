import FireLayer from './FireLayer';
import init from 'vue-iclient/src/init';

FireLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(FireLayer.options ? FireLayer.options.name : FireLayer.name, FireLayer);
};

export default FireLayer;
