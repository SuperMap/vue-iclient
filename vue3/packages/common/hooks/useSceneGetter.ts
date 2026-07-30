import { watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import sceneEvent from 'vue-iclient-core/types/scene-event';
import WebSceneViewModel from 'vue-iclient-controllers-mapboxgl/src/WebSceneViewModel';
interface SceneGetterProps {
  sceneTarget: string;
}

export interface SceneGetterOptions {
  loaded?: (viewer: any, webscene?: InstanceType<typeof WebSceneViewModel>) => void
  removed?: (viewer: any) => void
}

export function useSceneGetter({ loaded, removed }: SceneGetterOptions) {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as SceneGetterProps
  
  const getSceneData = (target: string) => {
    return sceneEvent.getScene(target);
  }

  const getSceneViewer = (target: string) => {
    return getSceneData(target)?.viewer;
  }

  const getWebScene = (target: string) => {
    return getSceneData(target)?.webscene as InstanceType<typeof WebSceneViewModel> | undefined;
  }

  const loadedHandler = (e: { sceneTarget: string, webscene?: InstanceType<typeof WebSceneViewModel> }) => {
    const { sceneTarget: target, webscene } = e;
    if (target === props.sceneTarget) {
      loaded?.(getSceneViewer(target), webscene || getWebScene(target))
    }
  };

  watch(() => props.sceneTarget, (newVal: string, oldVal: string) => {
    if (newVal && newVal !== oldVal) {
      const prevViewer = getSceneViewer(oldVal);
      if (prevViewer) {
        removed?.(prevViewer);
      }
      const nextViewer = getSceneViewer(newVal);
      if (nextViewer) {
        loaded?.(nextViewer, getWebScene(newVal));
      }
    }
  });

  onMounted(() => {
    const currentViewer = getSceneViewer(props.sceneTarget);
    if (currentViewer) {
      loaded?.(currentViewer, getWebScene(props.sceneTarget));
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
