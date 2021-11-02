import LayerList from './LayerList';
import init from 'vue-iclient/src/init';

LayerList.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(LayerList.options ? LayerList.options.name : LayerList.name, LayerList);
};

export default LayerList;
