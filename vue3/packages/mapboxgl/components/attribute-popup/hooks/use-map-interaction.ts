import type { Map } from 'mapbox-gl'
import type mapboxglTypes from 'mapbox-gl'
import type { ComputedRef, CSSProperties, Ref } from 'vue'
import type {
  AttributePopupInteraction,
  PopupFieldItem
} from '../../base-attribute-popup/types'
import type { MapSelectionChangedEvent } from '@supermapgis/mapboxgl/components/layer-highlight/types'
import { computed, onBeforeMount, onUnmounted, reactive, ref, watch } from 'vue'
import { useMapGetter } from '@supermapgis/common/hooks/index.common'
import PopupViewModel from 'vue-iclient-controllers-mapboxgl/src/PopupViewModel'
import MapPopupViewModel from 'vue-iclient-controllers-mapboxgl/src/MapPopupViewModel'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { isEqual } from 'lodash-es'

interface UseMapAttributePopupInteractionOptions {
  props: Record<string, any>
  layerIds: Ref<string[]> | ComputedRef<string[]>
  sourceLayers: Ref<string[][]> | ComputedRef<string[][]>
  popupBgStyle: ComputedRef<CSSProperties | Record<string, any>>
}

/**
 * 地图属性弹窗交互：封装 PopupViewModel + MapPopupViewModel，对齐 AttributePopupInteraction。
 */
export function useMapAttributePopupInteraction(
  options: UseMapAttributePopupInteractionOptions
): AttributePopupInteraction {
  const { props, layerIds, sourceLayers, popupBgStyle } = options
  const { setViewModel } = useMapGetter<Map>({ removed: clear })

  const allPopupDatas = ref<PopupFieldItem[][]>([])
  const lnglats = ref<any[]>([])
  const clickedLayers = ref<any[]>([])
  const clickedLngLat = ref<mapboxglTypes.LngLat>()
  const isMultipleClick = ref(false)
  const isSecMultipleClick = ref(false)
  const isRender = ref(false)
  const rootStyle = computed(() => ({}))
  const rootEl = ref<HTMLElement | null | undefined>()
  const clickEvent = computed(() => ({
    lngLat: clickedLngLat.value
  }))
  const popupMount = reactive({
    coordinates: null as any
  })

  let highlightViewModel: any = null
  const mapPopupViewModel = new MapPopupViewModel()
  useMapGetter({ viewModel: mapPopupViewModel })

  watch(layerIds, (next, prev) => {
    if (!isEqual(next, prev)) {
      clearPopupData()
      highlightViewModel?.setTargetLayers(next, sourceLayers.value)
    }
  })

  watch(
    () => props.layerStyle,
    next => {
      highlightViewModel?.setHighlightStyle(next)
    }
  )

  watch(
    () => props.multiSelect,
    next => {
      highlightViewModel?.setMultiSelection(next)
      clearPopupData()
    }
  )

  watch(
    () => props.featureFieldsMap,
    next => {
      highlightViewModel?.setFeatureFieldsMap(next)
    }
  )

  watch(
    () => props.displayFieldsMap,
    next => {
      highlightViewModel?.setDisplayFieldsMap(next)
    }
  )

  watch(
    () => props.clickTolerance,
    next => {
      highlightViewModel?.setClickTolerance(next)
    }
  )

  watch(
    () => popupMount.coordinates,
    () => {
      addPopup()
    }
  )

  onBeforeMount(() => {
    highlightViewModel = new PopupViewModel({
      name: 'popup',
      layerIds: layerIds.value,
      sourceLayers: sourceLayers.value,
      style: props.layerStyle,
      featureFieldsMap: props.featureFieldsMap,
      displayFieldsMap: props.displayFieldsMap,
      clickTolerance: props.clickTolerance,
      multiSelection: props.multiSelect,
      eventsCursor: props.eventsCursor
    })
    setViewModel(highlightViewModel)
    registerEvents()
  })

  onUnmounted(() => {
    clearPopupData()
  })

  function registerEvents() {
    highlightViewModel.on('layerclick', (e: any) => {
      if (!e.isMultipleClick || !e.isSecMultipleClick) {
        clickedLayers.value = e.layers
      }
      clickedLngLat.value = e.lngLat
      isMultipleClick.value = e.isMultipleClick
      isSecMultipleClick.value = e.isSecMultipleClick
    })
    highlightViewModel.on(
      'mapselectionchanged',
      (e: MapSelectionChangedEvent & { features?: any[]; targetId?: string }) => {
        const features = e.features
        if (features?.[0]) {
          allPopupDatas.value = e.popupInfos as PopupFieldItem[][]
          lnglats.value = e.lnglats
        }
        if (!features?.[0]) {
          clearPopupData()
        }
      }
    )
  }

  function setLayerIds(ids: string[], nextSourceLayers?: string[][]) {
    highlightViewModel?.setTargetLayers(ids, nextSourceLayers)
  }

  function queryFeaturesByLayerId(layerId: string) {
    highlightViewModel?.queryFeaturesByLayerId(layerId)
  }

  function setHighlightLayerFilter(
    layerId: string,
    identifyFields: { field: string; values: any[] }
  ) {
    highlightViewModel?.setHighlightLayerFilter(layerId, identifyFields)
  }

  function setPopupCoordinates(coordinate: any) {
    popupMount.coordinates = coordinate
  }

  function bindRootEl(el: HTMLElement | null | undefined) {
    rootEl.value = el
  }

  function addPopup() {
    if (!popupMount.coordinates || !rootEl.value) {
      return
    }
    isRender.value = true
    mapPopupViewModel.addPopup(popupMount.coordinates, rootEl.value)
    setPopupArrowStyle((popupBgStyle.value as any)?.backgroundColor)
  }

  function removePopup() {
    isRender.value = false
    mapPopupViewModel.removePopup()
  }

  function clearPopupData(clearHighlight = true) {
    allPopupDatas.value = []
    lnglats.value = []
    clearHighlight && highlightViewModel?.clear()
  }

  function clear() {
    highlightViewModel?.clear()
  }

  return {
    isRender,
    isMultipleClick,
    isSecMultipleClick,
    clickedLngLat,
    clickedLayers,
    lnglats,
    allPopupDatas,
    rootStyle,
    clickEvent,
    setLayerIds,
    queryFeaturesByLayerId,
    setHighlightLayerFilter,
    setPopupCoordinates,
    bindRootEl,
    removePopup,
    clear
  }
}
