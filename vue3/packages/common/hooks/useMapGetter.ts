// 定义一个可复用的逻辑钩子
import { onMounted, onUnmounted, watch, nextTick, getCurrentInstance } from 'vue'
import MapWatcher from 'vue-iclient-core/mixin/MapWatcher'
import { message } from 'ant-design-vue'

export interface MapGetterOptions<M> {
  viewModel?: InstanceType<any>
  loaded?: (map: M, webmap: InstanceType<any>) => void
  removed?: (map: M, target: string) => void
}

interface MapGetterProps {
  mapTarget: string
}

export function useMapGetter<M>({ viewModel, loaded, removed }: MapGetterOptions<M>) {
  const componentInstance = getCurrentInstance()
  const props = componentInstance.props as unknown as MapGetterProps
  const _mapWatcher = new MapWatcher(
    props.mapTarget,
    componentInstance.parent.props.target as string
  )
  let map: M
  let webmap: InstanceType<any>
  let viewModelInstance: InstanceType<any> = viewModel

  function _onHookLoaded({ map: loadedMap, webmap: loadedWebmap }) {
    map = loadedMap
    webmap = loadedWebmap
    loaded?.(map, webmap)
    nextTick(() => {
      componentInstance.emit('loaded')
    })
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
    _mapWatcher.onMounted({ viewModel: viewModelInstance })
    _mapWatcher.on({ 'hook:loaded': _onHookLoaded, 'hook:removed': _onHookRemoved })
  })

  onUnmounted(() => {
    _mapWatcher.onUnmounted()
    _mapWatcher.un({ 'hook:loaded': _onHookLoaded, 'hook:removed': _onHookRemoved })
  })

  watch(
    () => props.mapTarget,
    (next: string, prev: string) => {
      _mapWatcher.onMapTargetChanged(next, prev)
    }
  )

  return {
    map,
    webmap,
    getTargetName: () => _mapWatcher.targetName,
    setViewModel,
    mapNotLoadedTip
  }
}
