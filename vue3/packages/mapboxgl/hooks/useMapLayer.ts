import type { Map } from 'mapbox-gl'
import type { LayerProps, LayerEmits, LayerLayout, LayerPaint } from '@supermapgis/mapboxgl/utils'
import type { MapEventHandler } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents'
import { computed, watch, getCurrentInstance } from 'vue'
import { isEqual } from 'lodash-es'
import MapEvents, { LAYER_EVENT_NAMES } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents'
import { useEventListeners } from '@supermapgis/common/hooks/index.common'
import { uniqueId } from 'lodash-es'

export interface MapLayerOptions {
  props: LayerProps
  emit: LayerEmits
  viewModel: InstanceType<any>
}

export function createDefaultLayerId(componentName: string) {
  return uniqueId(`${componentName}-`)
}

export function useMapLayer({ props, emit, viewModel }: MapLayerOptions) {
  const { eventListenerNames } = useEventListeners()
  const componentInstance = getCurrentInstance()
  const componentName = componentInstance.type.name
  let mapEvents: InstanceType<typeof MapEvents>
  let map: Map;

  const sourceLoaded = computed(() => {
    const sourceId = props.sourceId || props.layerId
    return map && sourceId ? map.isSourceLoaded(sourceId) : false
  })

  const mapLayer = computed(() => {
    return map ? map.getLayer(props.layerId) : null
  })

  const mapSource = computed(() => {
    const sourceId = props.sourceId || props.layerId
    return map && sourceId ? map.getSource(sourceId) : null
  })

  const mapLayerId = computed(() => {
    return props.layerId || createDefaultLayerId(componentName)
  })

  watch(
    () => props.minzoom,
    (next: number) => {
      map?.setLayerZoomRange(props.layerId, next, props.maxzoom)
    }
  )

  watch(
    () => props.maxzoom,
    (next: number) => {
      map?.setLayerZoomRange(props.layerId, props.minzoom, next)
    }
  )

  watch(
    () => props.filter,
    (next: any[], pre: any[]) => {
      if (!isEqual(next, pre) && map) {
        map.setFilter(props.layerId, next)
      }
    }
  )

  watch(
    () => props.layout,
    (next: LayerLayout, pre: LayerLayout) => {
      if (!isEqual(next, pre) && map) {
        for (const prop of Object.keys(next)) {
          map.setLayoutProperty(props.layerId, prop, next[prop])
        }
      }
    }
  )

  watch(
    () => props.paint,
    (next: LayerPaint, pre: LayerPaint) => {
      if (!isEqual(next, pre) && map) {
        for (const prop of Object.keys(next)) {
          map.setPaintProperty(props.layerId, prop, next[prop])
        }
      }
    }
  )

  watch(
    mapLayerId,
    (next: string) => {
      viewModel?.setLayerId?.(next)
    }
  )

  function loaded(acceptedMap: Map) {
    map = acceptedMap;
    bindLayerEvents();
  }

  function removed() {
    remove()
  }

  function bindLayerEvents() {
    mapEvents = new MapEvents(eventListenerNames)
    const builtInEvents = LAYER_EVENT_NAMES.reduce(
      (listeners, eventName) => {
        listeners[eventName] = ({ mapParams }: { mapParams: MapEventHandler }) => {
          // @ts-ignore
          emit(eventName, mapParams)
        }
        return listeners
      },
      {} as Record<string, (params: { mapParams: MapEventHandler }) => void>
    )
    mapEvents.on(builtInEvents)
    // @ts-ignore
    mapEvents.bindMapEvents(map)
  }

  function unbindLayerEvents() {
    mapEvents.unbindMapEvents()
  }

  function move(beforeId: string) {
    if (map) {
      map.moveLayer(this.layerId, beforeId)
      emit('layer-moved', {
        map,
        layerId: props.layerId,
        beforeId: beforeId
      })
    }
  }

  function remove() {
    unbindLayerEvents()
    viewModel?.removed?.()
    emit('layer-removed', { map, layerId: props.layerId })
  }

  return {
    sourceLoaded,
    mapLayer,
    mapSource,
    loaded,
    removed,
    move,
    remove
  }
}
