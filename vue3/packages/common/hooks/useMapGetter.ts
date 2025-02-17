// 定义一个可复用的逻辑钩子
import type { Ref } from 'vue'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import mapEvent from 'vue-iclient-core/types/map-event'
import type { MapVmInfo } from 'vue-iclient-core/mixin/MapWatcher'
import MapWatcher from 'vue-iclient-core/mixin/MapWatcher'
import { message } from 'ant-design-vue'

export function useMapGetter<M>(mapTarget: Ref<string>, mapVmInfo: MapVmInfo) {
  const _mapWatcher = new MapWatcher(mapEvent, mapTarget.value, mapVmInfo)
  const map = ref<M>(null)
  const webmap = ref<InstanceType<any>>(null)

  function _onHookLoaded({ map: loadedMap, webmap: loadedWebmap }) {
    map.value = loadedMap
    webmap.value = loadedWebmap
  }

  function mapNotLoadedTip() {
    if (!map) {
      message.destroy()
      message.warning('warning.unassociatedMap')
      return true
    }
    return false
  }

  onMounted(() => {
    _mapWatcher.on({ 'hook:loaded': _onHookLoaded })
  })

  onUnmounted(() => {
    _mapWatcher.un({ 'hook:loaded': _onHookLoaded })
  })

  watch(mapTarget, (next: string, prev: string) => {
    _mapWatcher.onMapTargetChanged(next, prev)
  })

  return {
    map,
    webmap,
    getTargetName: () => _mapWatcher.targetName,
    mapNotLoadedTip
  }
}