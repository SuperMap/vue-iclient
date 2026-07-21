import type { ControlPosition } from 'vue-iclient-controllers-mapboxgl/src/utils/MapControl'
import { watch, getCurrentInstance, nextTick, onBeforeUnmount, unref } from 'vue'

interface SceneControlProps {
  position: ControlPosition
  sceneTarget: string
}

type SceneControlEl =
  | HTMLElement
  | null
  | undefined
  | { value: HTMLElement | null | undefined }
  | (() => HTMLElement | null | undefined)

function resolveControlEl(el: SceneControlEl) {
  if (typeof el === 'function') {
    return el()
  }
  return unref(el)
}

export function useSceneControl(el: SceneControlEl) {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as SceneControlProps
  const parentInstance = componentInstance.parent
  // const parentIsWebScene = parentInstance.type.name === 'SmWebScene'
  const parentIsWebScene = parentInstance.type.name === 'SmWebScene' || parentInstance.parent.type.name === 'SmWebScene'
  let isUnmounted = false
  let controlEl: HTMLElement | null = null

  watch(
    [() => props.position, () => resolveControlEl(el)],
    ([newVal, nextEl], _, onCleanup) => {
      let isInvalid = false
      onCleanup(() => {
        isInvalid = true
      })

      nextTick(() => {
        if (isUnmounted || isInvalid || !parentIsWebScene || !nextEl) {
          return
        }

        const newContainer = document.querySelector(`#${props.sceneTarget} .scene-control-${newVal}`)
        if (!newContainer) {
          return
        }

        if (controlEl && controlEl !== nextEl) {
          controlEl.remove()
        }
        newContainer.appendChild(nextEl)
        nextEl.classList.add('scene-ctrl')
        controlEl = nextEl

        if (newVal === 'top-right') {
          // 将罗盘放到control子组件后面
          const navigation = document.querySelector(`#${props.sceneTarget} .supermap3d-viewer-navigationContainer`)
          if (navigation) {
            navigation.classList.add('scene-ctrl')
            newContainer.appendChild(navigation)
          }
        }
      })
    },
    { immediate: true }
  )

  // A control can be moved outside a fragment root, so remove it before Vue unmounts the fragment.
  onBeforeUnmount(() => {
    isUnmounted = true
    controlEl?.remove()
    controlEl = null
  })

  return {
    parentIsWebScene
  }
}
