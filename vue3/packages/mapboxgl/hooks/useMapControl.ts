import type { ControlPosition } from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'
import { ref, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue'
import MapControl from 'vue-iclient-core/controllers/mapboxgl/utils/MapControl'

interface MapControlProps {
  position: ControlPosition
  mapTarget: string
}

interface MapControlParentProps {
  target: string
}

export function useMapControl() {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as MapControlProps
  const componentName = componentInstance.type.name ?? ''
  const parentInstance = componentInstance.parent
  const parentProps = parentInstance.props as unknown as MapControlParentProps
  const parentVmName = parentInstance.type.name ?? ''
  const parentIsWebMapOrMap = ['smwebmap', 'smncpmap'].includes(parentVmName.toLowerCase())
  const parentMapTarget = parentIsWebMapOrMap ? parentProps.target : undefined
  let _mapControl: InstanceType<typeof MapControl>
  let isDelayLoading = !['smwebmap', 'smminimap', 'smncpmap'].includes(componentName.toLowerCase())

  const isShow = ref<boolean>(true)

  function controlLoaded() {
    if (isDelayLoading) {
      isShow.value = true
      const $el = componentInstance.proxy.$el
      $el?.style && ($el.style.display = 'block')
    }
  }

  watch(
    () => props.position,
    (next: ControlPosition) => {
      _mapControl?.onPositionChanged(next)
    }
  )

  onMounted(() => {
    const el = componentInstance.proxy.$el
    _mapControl = new MapControl({
      el,
      position: props.position,
      mapTarget: props.mapTarget,
      parentTarget: parentMapTarget
    })
    _mapControl.on({
      'hook:loaded': controlLoaded
    })
    if (el && parentIsWebMapOrMap) {
      if (isDelayLoading) {
        isShow.value = false
        el.style && (el.style.display = 'none')
      }
      _mapControl.onMounted()
    }
  })

  onBeforeUnmount(() => {
    _mapControl.un({
      'hook:loaded': controlLoaded
    })
    _mapControl.onBeforeUnmount()
  })

  return {
    isShow,
    parentIsWebMapOrMap
  }
}
