import TileLayer from './TileLayer';
import init from 'vue-iclient/src/init';

TileLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(TileLayer.options ? TileLayer.options.name : TileLayer.name, TileLayer);
};

export default TileLayer;
