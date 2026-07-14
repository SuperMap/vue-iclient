import type { Map } from 'mapbox-gl'
import type mapboxglTypes from 'mapbox-gl'
import type { MapSelectionChangedEvent } from '@supermapgis/mapboxgl/components/layer-highlight/types'
import { ref, watch, onUnmounted, onBeforeMount } from 'vue'
import { useMapGetter } from '@supermapgis/common/hooks/index.common'
import PopupViewModel from 'vue-iclient-controllers-mapboxgl/src/PopupViewModel'
import { isEqual } from 'lodash-es'

export function useLayerHighlightHooks(props, layerIds, sourceLayers) {
  const { setViewModel } = useMapGetter<Map>({ removed })
  const allPopupDatas = ref<MapSelectionChangedEvent['popupInfos'] & { disabled?: boolean }>([])
  const lnglats = ref<MapSelectionChangedEvent['lnglats'] & { disabled?: boolean }>([])
  const activeTargetName = ref('')
  const clickedLayers = ref<any[]>([])
  const clickedLngLat = ref<mapboxglTypes.LngLat>()
  const isMultipleClick = ref(false) //是否是多选
  const isSecMultipleClick = ref(false) //是否是已经选中过图层的多选

  let viewModel: any = null

  // 监听props变化
  watch(layerIds, (next, prev) => {
    if (!isEqual(next, prev)) {
      clearPopupData()
      viewModel?.setTargetLayers(next, sourceLayers.value)
    }
  })

  watch(
    () => props.layerStyle,
    next => {
      viewModel?.setHighlightStyle(next)
    }
  )

  watch(
    () => props.multiSelect,
    next => {
      viewModel?.setMultiSelection(next)
      clearPopupData()
    }
  )

  watch(
    () => props.featureFieldsMap,
    next => {
      viewModel?.setFeatureFieldsMap(next)
    }
  )

  watch(
    () => props.displayFieldsMap,
    next => {
      viewModel?.setDisplayFieldsMap(next)
    }
  )

  watch(
    () => props.clickTolerance,
    next => {
      viewModel?.setClickTolerance(next)
    }
  )

  // 生命周期钩子
  onBeforeMount(() => {
    viewModel = new PopupViewModel({
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
    setViewModel(viewModel)
    registerEvents()
  })

  onUnmounted(() => {
    clearPopupData()
  })

  function setLayerIds(layerIds: string[], sourceLayers?: string[][]) {
    viewModel?.setTargetLayers(layerIds, sourceLayers)
  }

  function registerEvents() {
    viewModel.on('layerclick', (e: any) => {
      // 如果是单选或者多选第一次点击，更新clickedLayers
      if (!e.isMultipleClick || !e.isSecMultipleClick) {
        clickedLayers.value = e.layers
      }
      clickedLngLat.value = e.lngLat
      isMultipleClick.value = e.isMultipleClick
      isSecMultipleClick.value = e.isSecMultipleClick
    })
    viewModel.on('mapselectionchanged', (e: any) => {
      const features = e.features
      if (features[0]) {
        allPopupDatas.value = e.popupInfos
        lnglats.value = e.lnglats
      }
      if (!features[0]) {
        clearPopupData()
      }
      activeTargetName.value = e.targetId
    })
  }

  function queryFeaturesByLayerId(layerId: string) {
    viewModel?.queryFeaturesByLayerId(layerId)
  }
  function setHighlightLayerFilter(
    layerId: string,
    identifyFields: { field: string; values: any[] }
  ) {
    viewModel?.setHighlightLayerFilter(layerId, identifyFields)
  }

  function clearPopupData(clear: boolean = true) {
    allPopupDatas.value = []
    lnglats.value = []
    clear && viewModel?.clear()
  }

  function removed() {
    viewModel?.clear()
  }

  return {
    lnglats,
    allPopupDatas,
    clickedLayers,
    clickedLngLat,
    isMultipleClick,
    isSecMultipleClick,
    setLayerIds,
    removed,
    queryFeaturesByLayerId,
    setHighlightLayerFilter
  }
}
