import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import { watch, getCurrentInstance, nextTick } from 'vue'

interface SceneControlProps {
  position: ControlPosition
  sceneTarget: string
}

export function useSceneControl(el: HTMLElement) {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as SceneControlProps
  const parentInstance = componentInstance.parent
  // const parentIsWebScene = parentInstance.type.name === 'SmWebScene'
  const parentIsWebScene = parentInstance.type.name === 'SmWebScene' || parentInstance.parent.type.name === 'SmWebScene'
  watch(
    () => props.position,
    (newVal: ControlPosition) => {
      nextTick(() => {
        if (parentIsWebScene) {
          const newContainer = document.querySelector(`#${props.sceneTarget} .scene-control-${newVal}`);
          newContainer.appendChild(el);
          el.classList.add('scene-ctrl');
          if (newVal === 'top-right') {
            // 将罗盘放到control子组件后面
            const navigation = document.querySelector(`#${props.sceneTarget} .supermap3d-viewer-navigationContainer`);
            if (navigation) {
              navigation.classList.add('scene-ctrl');
              newContainer.appendChild(navigation);
            }
          }
        }
      })
    }, { immediate: true}
  )

  return {
    parentIsWebScene
  }
}
