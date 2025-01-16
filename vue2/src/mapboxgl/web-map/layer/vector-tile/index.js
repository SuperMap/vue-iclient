import VectorTileLayer from './VectorTileLayer';
import init from 'vue-iclient/src/init';

VectorTileLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(VectorTileLayer.options ? VectorTileLayer.options.name : VectorTileLayer.name, VectorTileLayer);
};

export default VectorTileLayer;
