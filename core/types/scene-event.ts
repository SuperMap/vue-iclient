import { Events } from 'vue-iclient-core/types/event/Events';

export class SceneEvent extends Events {
  sceneCache: Record<string, Record<string, any>> = {};

  triggerEvent: (name: string, ...rest: any) => any;
  on: (data: Record<string, (...rest: any) => void>) => void;
  un: (data: Record<string, (...rest: any) => void>) => void;
  eventTypes: string[];
  
  constructor() {
    super();
    this.eventTypes = ['load-scene', 'update-layers'];
  }

  getScene(sceneTarget: string) {
    return this.sceneCache[sceneTarget];
  }

  getAllScenes() {
    return this.sceneCache;
  }

  setScene(sceneTarget: string, scene: Record<string, any>) {
    this.sceneCache[sceneTarget] = scene;
  }

  triggerLoadEvent(sceneTarget: string) {
    this.triggerEvent('load-scene', { sceneTarget });
  }

  triggerUpdateEvent(sceneTarget: string) {
    this.triggerEvent('update-layers', { sceneTarget });
  }

  deleteScene(sceneTarget: string) {
    if (this.sceneCache[sceneTarget]) {
      delete this.sceneCache[sceneTarget];
    }
  }
}

export default new SceneEvent();
