import TrackLayer from './TrackLayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

TrackLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(TrackLayer.options ? TrackLayer.options.name : TrackLayer.name, TrackLayer);
};

export default TrackLayer;
