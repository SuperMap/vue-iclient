import MapvLayer from './MapvLayer';
import init from 'vue-iclient/src/init';

MapvLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(MapvLayer.options ? MapvLayer.options.name : MapvLayer.name, MapvLayer);
};

export default MapvLayer;
