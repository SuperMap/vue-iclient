import LayerManager from './LayerManager';
import init from 'vue-iclient/src/init';

LayerManager.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LayerManager.options ? LayerManager.options.name : LayerManager.name, LayerManager);
};

export default LayerManager;
