import LayerHighlight from './LayerHighlight';
import init from 'vue-iclient/src/init';

LayerHighlight.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LayerHighlight.options ? LayerHighlight.options.name : LayerHighlight.name, LayerHighlight);
};

export default LayerHighlight;
