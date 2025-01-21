import RasterTileLayer from './RasterTileLayer';
import init from 'vue-iclient/src/init';

RasterTileLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(RasterTileLayer.options ? RasterTileLayer.options.name : RasterTileLayer.name, RasterTileLayer);
};

export default RasterTileLayer;
