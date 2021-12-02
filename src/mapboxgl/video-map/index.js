import VideoMap from './VideoMap';
import init from 'vue-iclient/src/init';

VideoMap.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(VideoMap.options ? VideoMap.options.name : VideoMap.name, VideoMap);
};

export default VideoMap;
