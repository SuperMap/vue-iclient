import LayerSelect from './LayerSelect';
import init from 'vue-iclient/src/init';

LayerSelect.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LayerSelect.options ? LayerSelect.options.name : LayerSelect.name, LayerSelect);
};

export default LayerSelect;
