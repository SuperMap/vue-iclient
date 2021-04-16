import RasterTileLayer from './RasterTileLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

RasterTileLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(RasterTileLayer.options ? RasterTileLayer.options.name : RasterTileLayer.name, RasterTileLayer);
};

export default RasterTileLayer;
