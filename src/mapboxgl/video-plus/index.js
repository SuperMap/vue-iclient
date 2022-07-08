import VideoPlus from './VideoPlus';
import init from 'vue-iclient/src/init';

VideoPlus.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(VideoPlus.options ? VideoPlus.options.name : VideoPlus.name, VideoPlus);
};

export default VideoPlus;
