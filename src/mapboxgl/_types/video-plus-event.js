import Vue from 'vue';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';

export default new Vue({
  videoCache: {},
  getVideo: function(target) {
    return this.videoCache[target];
  },
  getAllVideos: function() {
    return this.videoCache;
  },
  setVideo: function(target, video) {
    this.videoCache[target] = video;
  },
  deleteVideo: function(target) {
    if (this.videoCache[target]) {
      globalEvent.$emit('delete-video', target);
      delete this.videoCache[target];
    }
  }
});
