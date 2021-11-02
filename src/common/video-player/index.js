import VideoPlayer from './VideoPlayer';
import init from 'vue-iclient/src/init';

VideoPlayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(VideoPlayer.options ? VideoPlayer.options.name : VideoPlayer.name, VideoPlayer);
};

export default VideoPlayer;
