import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import sceneEvent from 'vue-iclient-core/types/scene-event';

interface LayerTreeAlias {
  s3mLayer: object,
  imgLayer: object,
  mvtLayer: object,
  terrainLayer: object
}
export function useSceneGetter(sceneTarget: string) {
  const layerTreeAlias = ref<LayerTreeAlias>({});
  const viewer = ref(null);

  const setViewer = (target) => {
    const { viewer: sceneViewer, content } = sceneEvent.getScene(target);
    if (!sceneViewer || !content) {
      return;
    }
    viewer.value = sceneViewer;
    const layers = content.layers;
    layerTreeAlias.value = layers.layerTreeAlias;
  };

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

  return {
    layerTreeAlias,
    viewer
  };
}