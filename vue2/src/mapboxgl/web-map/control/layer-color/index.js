import LayerColor from './LayerColor';
import init from 'vue-iclient/src/init';

LayerColor.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LayerColor.options ? LayerColor.options.name : LayerColor.name, LayerColor);
};

export default LayerColor;
