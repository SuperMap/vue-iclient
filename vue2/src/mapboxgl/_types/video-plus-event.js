import { Events } from 'vue-iclient-core/types/event/Events';

export class VideoPlusEvent extends Events {
  constructor() {
    super();
    this.eventTypes = ['load-video', 'delete-video'];
    this.videoCache = {};
  }

  getVideo(target) {
    return this.videoCache[target];
  }

  getAllVideos() {
    return this.videoCache;
  }

  setVideo(target, video) {
    this.videoCache[target] = video;
    this.triggerEvent('load-video', { videoTarget: target, video });
  }

  deleteVideo(target) {
    if (this.videoCache[target]) {
      this.triggerEvent('delete-video', { videoTarget: target });
      delete this.videoCache[target];
    }
  }
}

export default new VideoPlusEvent();
