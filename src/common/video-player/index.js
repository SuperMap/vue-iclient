import VideoPlayer from './VideoPlayer';
import Message from 'vue-iclient/src/common/message/index.js';
import init from 'vue-iclient/src/init';

VideoPlayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.prototype.$message = Message;
  Vue.component(VideoPlayer.options ? VideoPlayer.options.name : VideoPlayer.name, VideoPlayer);
};

export default VideoPlayer;
