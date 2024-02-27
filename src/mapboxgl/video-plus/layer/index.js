import VideoLayer from './VideoLayer';
import init from 'vue-iclient/src/init';

VideoLayer.install = function(Vue, opts) {
  init(Vue, opts);
  Vue.component(VideoLayer.options ? VideoLayer.options.name : VideoLayer.name, VideoLayer);
};

export default VideoLayer;
