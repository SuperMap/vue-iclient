import { watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import sceneEvent from 'vue-iclient-core/types/scene-event';

interface SceneGetterProps {
  sceneTarget: string;
}

export interface SceneGetterOptions {
  loaded?: (viewer: any) => void
  removed?: (viewer: any) => void
}

export function useSceneGetter({ loaded, removed }: SceneGetterOptions) {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as SceneGetterProps
  
  const getSceneViewer  = (target: string) => {
    const data = sceneEvent.getScene(target);
    if (!data) {
      return;
    }
    const { viewer: sceneViewer } = data;
    return sceneViewer;
  }
  const loadedHandler = (e: { sceneTarget: string }) => {
    const { sceneTarget: target } = e;
    if (target === props.sceneTarget) {
      loaded(getSceneViewer(target))
    }
  };

  watch(() => props.sceneTarget, (newVal: string, oldVal: string) => {
    if (newVal && newVal !== oldVal) {
      const prevViewer = getSceneViewer(oldVal);
      if (prevViewer) {
        removed(prevViewer);
      }
      const nextViewer = getSceneViewer(newVal);
      if (nextViewer) {
        loaded(nextViewer);
      }
    }
  });

  onMounted(() => {
    const currentViewer = getSceneViewer(props.sceneTarget);
    if (currentViewer) {
      loaded(currentViewer);
    }
    sceneEvent.on({
      'load-scene': loadedHandler
    });
  });

  onBeforeUnmount(() => {
    sceneEvent.un({
      'load-scene': loadedHandler
    });
  });
}