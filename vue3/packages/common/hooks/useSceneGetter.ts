import { watch, onMounted, onBeforeUnmount } from 'vue';
import sceneEvent from 'vue-iclient-core/types/scene-event';


export function useSceneGetter(sceneTarget: string, setViewer: any) {
  
  const loadedHandler = (e: { sceneTarget: string }) => {
    const { sceneTarget: target } = e;
    if (target === sceneTarget) {
      setViewer(target);
    }
  };

  watch(sceneTarget, (newVal, oldVal) => {
    if (newVal && oldVal && newVal !== oldVal) {
      setViewer(newVal);
    }
  });

  onMounted(() => {
    if (sceneEvent.getScene(sceneTarget)) {
      setViewer(sceneTarget);
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