// 定义一个可复用的逻辑钩子
import { onMounted, onUnmounted, watch } from 'vue'
import mapEvent from 'vue-iclient-core/types/map-event'
import type { MapVmInfo } from 'vue-iclient-core/mixin/MapWatcher'
import MapWatcher from 'vue-iclient-core/mixin/MapWatcher'
import { message } from 'ant-design-vue'

interface useMapGetterOptions<M> {
  mapPropGetter: () => string
  mapVmInfo: MapVmInfo
  viewModel: InstanceType<any>
  loaded?: (map: M, webmap: InstanceType<any>) => void
  removed?: (map: M, target: string) => void
}

export function useMapGetter<M>({
  mapPropGetter,
  mapVmInfo,
  viewModel,
  loaded,
  removed
}: useMapGetterOptions<M>) {
  const _mapWatcher = new MapWatcher(mapEvent, mapPropGetter(), mapVmInfo)
  let map: M
  let webmap: InstanceType<any>
  let viewModelInstance: InstanceType<any>

  function _onHookLoaded({ map: loadedMap, webmap: loadedWebmap }) {
    map = loadedMap
    webmap = loadedWebmap
    loaded?.(map, webmap)
  }
  function _onHookRemoved({ map, mapTarget }) {
    map = null
    webmap = null
    removed?.(map, mapTarget)
  }

  function mapNotLoadedTip() {
    if (!map) {
      message.destroy()
      message.warning('warning.unassociatedMap')
      return true
    }
    return false
  }

  function setViewModel(vm: InstanceType<any>) {
    viewModelInstance = vm
  }

  onMounted(() => {
    _mapWatcher.mounted({ viewModel: viewModelInstance })
    _mapWatcher.on({ 'hook:loaded': _onHookLoaded, 'hook:removed': _onHookRemoved })
  })

  onUnmounted(() => {
    _mapWatcher.unmounted()
    _mapWatcher.un({ 'hook:loaded': _onHookLoaded, 'hook:removed': _onHookRemoved })
  })

  watch(mapPropGetter, (next: string, prev: string) => {
    _mapWatcher.onMapTargetChanged(next, prev)
  })

  return {
    map,
    webmap,
    getTargetName: () => _mapWatcher.targetName,
    setViewModel,
    mapNotLoadedTip
  }
}
