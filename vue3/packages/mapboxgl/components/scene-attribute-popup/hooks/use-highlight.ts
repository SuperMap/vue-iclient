import type { CSSProperties } from 'vue'
import type {
  AttributePopupInteraction,
  PopupFieldItem
} from '@supermapgis/mapboxgl/components/base-attribute-popup/types'
import type { HighlightStyle } from 'vue-iclient-controllers-mapboxgl/src/LayerHighlightViewModel'
import type { ScenePopupInfo } from '../types'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useSceneGetter } from '@supermapgis/common/hooks/index.common'
import SceneHighlightViewModel from 'vue-iclient-controllers-mapboxgl/src/SceneHighlightViewModel'
import { popupInfosToQueryLayers } from '../types'
import WebSceneViewModel from 'vue-iclient-controllers-mapboxgl/src/WebSceneViewModel'

interface UseSceneHighlightOptions {
  props: {
    popupInfos?: ScenePopupInfo[]
    clickTolerance?: number
    layerStyle?: HighlightStyle
    multiSelect?: boolean
    enabled?: boolean
  }
  /** 可选：向外部透出查询事件 */
  onSelectionChanged?: (result: any) => void
  onQueryStart?: (payload: any) => void
  onQueryEnd?: (payload: any) => void
  onQueryFailed?: (error: unknown) => void
}

/**
 * 场景属性弹窗高亮交互：封装 SceneHighlightViewModel，对齐 AttributePopupInteraction 同名方法。
 * 弹窗屏幕投影 + placement/clamp、按层组装弹窗数据均由 ViewModel 负责，hooks 只消费事件。
 */
export function useLayerHighlightHooks(
  options: UseSceneHighlightOptions
): AttributePopupInteraction {
  const { props } = options

  const allPopupDatas = ref<PopupFieldItem[][]>([])
  const lnglats = ref<any[]>([])
  const clickedLayers = ref<Array<{ id: string; type?: string; name?: string }>>([])
  const clickedLngLat = ref<any>()
  const isMultipleClick = ref(false)
  const isSecMultipleClick = ref(false)
  const isRender = ref(false)
  const screenPosition = ref<{ x: number; y: number } | null>(null)
  const rootStyle = ref<CSSProperties>({})
  const rootClass = ref('')

  const viewModel = new SceneHighlightViewModel({
    layers: popupInfosToQueryLayers(props.popupInfos),
    clickTolerance: props.clickTolerance,
    layerStyle: props.layerStyle,
    multiSelect: props.multiSelect,
    enabled: props.enabled
  })

  const clickEvent = computed(() => ({
    lngLat: clickedLngLat.value,
    position: screenPosition.value || undefined
  }))
  viewModel.on('selectionchanged', handleSelectionChanged)
  viewModel.on('mapselectionchanged', handleMapSelectionChanged)
  viewModel.on('popuppositionchanged', handlePopupPositionChanged)
  viewModel.on('querystart', (e: any) => options.onQueryStart?.(e))
  viewModel.on('queryend', (e: any) => options.onQueryEnd?.(e))
  viewModel.on('queryfailed', (e: any) => options.onQueryFailed?.(e))

  useSceneGetter({
    loaded: (viewer: any, webscene: InstanceType<typeof WebSceneViewModel>) => {
      if (!viewer) {
        viewModel.setViewer(null)
        return
      }
      viewModel.setViewer(viewer, webscene)
    },
    removed: () => {
      viewModel.removed()
      clear()
      removePopup()
    }
  })

  watch(
    () => props.popupInfos,
    popupInfos => {
      viewModel.setLayers(popupInfosToQueryLayers(popupInfos))
    },
    { deep: true }
  )

  watch(
    () => props.clickTolerance,
    value => {
      if (typeof value === 'number') {
        viewModel.setClickTolerance(value)
      }
    }
  )

  watch(
    () => props.layerStyle,
    value => {
      if (value) {
        viewModel.setHighlightStyle(value)
      }
    },
    { deep: true }
  )

  watch(
    () => props.multiSelect,
    value => {
      viewModel.setMultiSelect(!!value)
    }
  )

  watch(
    () => props.enabled,
    value => {
      viewModel.setEnabled(value !== false)
      if (value === false) {
        removePopup()
        clear()
      }
    }
  )

  watch(isRender, visible => {
    viewModel.setPopupVisible(visible)
  })

  onBeforeUnmount(() => {
    viewModel.off('selectionchanged', handleSelectionChanged)
    viewModel.off('mapselectionchanged', handleMapSelectionChanged)
    viewModel.off('popuppositionchanged', handlePopupPositionChanged)
    viewModel.removed()
  })

  function handlePopupPositionChanged(e: {
    screenPosition?: { x: number; y: number }
    rootStyle?: CSSProperties
    rootClass?: string
  }) {
    if (e?.screenPosition) {
      screenPosition.value = e.screenPosition
    }
    rootStyle.value = e?.rootStyle || {}
    rootClass.value = e?.rootClass || ''
  }

  function handleSelectionChanged(result: any) {
    options.onSelectionChanged?.(result)

    const features = result?.features || []
    clickedLayers.value = result?.layers?.length
      ? result.layers
      : (result?.layerIds || []).map((id: string) => ({
          id,
          type: 'fill',
          name: id
        }))
    clickedLngLat.value = result?.lngLat
      ? {
          lng: result.lngLat[0],
          lat: result.lngLat[1],
          height: result.height || 0
        }
      : undefined
    screenPosition.value = result?.screenPosition || null
    isMultipleClick.value = !!result?.isMultipleClick
    isSecMultipleClick.value = !!result?.isSecMultipleClick
    allPopupDatas.value = []
    lnglats.value = []

    if (!features.length) {
      removePopup()
    }
  }

  function handleMapSelectionChanged(e: {
    features?: any[]
    popupInfos?: PopupFieldItem[][]
    lnglats?: any[]
  }) {
    const features = e?.features
    if (features?.[0]) {
      allPopupDatas.value = (e.popupInfos as PopupFieldItem[][]) || []
      lnglats.value = e.lnglats || []
      // 查到数据后立刻显示，并刷新锚点（不依赖 base sync 时序）
      isRender.value = true
      viewModel.setPopupVisible(true)
      const coord = e.lnglats?.[0] || clickedLngLat.value
      if (coord && typeof coord.lng === 'number' && typeof coord.lat === 'number') {
        viewModel.setPopupAnchor(coord.lng, coord.lat, coord.height || 0)
      }
      return
    }
    allPopupDatas.value = []
    lnglats.value = []
    removePopup()
  }

  /** 场景侧以 popupInfos.dataSource 为准，保留空实现以对齐 AttributePopupInteraction */
  function setLayerIds(_layerIds: string[], _sourceLayers?: string[][]) {}

  function queryFeaturesByLayerId(layerId: string) {
    viewModel.queryFeaturesByLayerId(layerId)
  }

  function setHighlightLayerFilter(
    layerId: string,
    identifyFields: { field: string; values: any[] }
  ) {
    viewModel.setHighlightLayerFilter(layerId, identifyFields)
  }

  function setPopupCoordinates(coordinate: any) {
    if (coordinate && typeof coordinate.lng === 'number' && typeof coordinate.lat === 'number') {
      if (clickedLayers.value.length) {
        // 先标记可见，再设锚点，避免 updatePopupLayout 因 popupVisible=false 直接 return
        isRender.value = true
        viewModel.setPopupVisible(true)
      }
      viewModel.setPopupAnchor(coordinate.lng, coordinate.lat, coordinate.height || 0)
    }
  }

  function bindRootEl(el: HTMLElement | null | undefined) {
    viewModel.bindPopupRootEl(el)
    if (isRender.value) {
      nextTick(() => viewModel.setPopupVisible(true))
    }
  }

  function removePopup() {
    isRender.value = false
    viewModel.setPopupVisible(false)
    rootStyle.value = {}
    rootClass.value = ''
  }

  function clear() {
    allPopupDatas.value = []
    lnglats.value = []
    rootStyle.value = {}
    rootClass.value = ''
    viewModel.clear()
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
    rootClass,
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
