<template>
  <SmMapPopup
    v-if="showPopup"
    class="sm-component-layer-highlight"
    :ref="uniqueName"
    :showIcon="multiSelection"
    :data="allPopupDatas"
    :lnglats="lnglats"
    :defaultIndex="currentIndex"
    :background="background"
    :textColor="textColor"
    :mapTarget="mapTarget"
    :titleRender="titleRender"
    :valueRender="valueRender"
    :showHeader="false"
    :title="displayTitle"
    @change="handleChange"
  />
</template>

<script setup lang="tsx">
import type { Map } from 'mapbox-gl'
import type { LayerHighlightProps, LayerHighlightEmits, ColumnStyle, MapSelectionChangedEvent, ColumnCustomRenderParams } from './types'
import { ref, computed, watch, onUnmounted, onBeforeMount, getCurrentInstance } from 'vue'
import { useMapGetter } from '@supermapgis/common/hooks/index.common'
import LayerHighlightViewModel from 'vue-iclient-core/controllers/mapboxgl/LayerHighlightViewModel'
import SmMapPopup from '@supermapgis/mapboxgl/components/map-popup/map-popup.vue'
import { isEqual } from 'lodash-es'
import { layerHighlightPropsDefault } from './types'

defineOptions({
  name: 'SmLayerHighlight'
})

const props = withDefaults(defineProps<LayerHighlightProps>(), layerHighlightPropsDefault)

const emit = defineEmits(['mapselectionchanged', 'loaded']) as unknown as LayerHighlightEmits

const { setViewModel } = useMapGetter<Map>({ removed })

const currentIndex = ref(0)
const allPopupDatas = ref<MapSelectionChangedEvent['popupInfos']>([])
const lnglats = ref<MapSelectionChangedEvent['lnglats']>([])
const activeTargetName = ref('')

const componentInstance = getCurrentInstance()
let viewModel: any = null
let mapSelectionsParams: MapSelectionChangedEvent

const columnStyle = computed(() => {
  const {
    autoResize,
    keyWidth,
    valueWidth,
    keyMaxWidth,
    valueMaxWidth,
    keyWordStyle,
    valueWordStyle
  } = props.popupStyle
  const style: ColumnStyle = { keyStyle: {}, valueStyle: {} }
  if (!autoResize) {
    if (keyWidth) {
      style.keyStyle.width = keyWidth + 'px'
    }
    if (valueWidth) {
      style.valueStyle.width = valueWidth + 'px'
    }
  } else {
    if (keyMaxWidth) {
      style.keyStyle.maxWidth = keyMaxWidth + 'px'
    }
    if (valueMaxWidth) {
      style.valueStyle.maxWidth = valueMaxWidth + 'px'
    }
  }
  const ellipsisStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
  if (keyWordStyle === 'ellipsis') {
    style.keyStyle = { ...style.keyStyle, ...ellipsisStyle, height: '22px' }
  }
  if (valueWordStyle === 'ellipsis') {
    style.valueStyle = { ...style.valueStyle, ...ellipsisStyle }
  }
  return style
})

const displayTitle = computed(() => props.title || activeTargetName.value)

// 监听props变化
watch(
  () => props.layers,
  (next, prev) => {
    if (!isEqual(next, prev)) {
      clearPopupData()
      viewModel?.setTargetLayers(next)
    }
  }
)

watch(
  () => props.highlightStyle,
  next => {
    viewModel?.setHighlightStyle(next)
  }
)

watch(
  () => props.multiSelection,
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
  viewModel = new LayerHighlightViewModel({
    name: props.uniqueName,
    layerIds: props.layers,
    style: props.highlightStyle,
    featureFieldsMap: props.featureFieldsMap,
    displayFieldsMap: props.displayFieldsMap,
    clickTolerance: props.clickTolerance,
    multiSelection: props.multiSelection,
    eventsCursor: props.eventsCursor
  })
  setViewModel(viewModel)
  registerEvents()
})

onUnmounted(() => {
  clearPopupData()
})
function removed() {
  clearPopupData()
}

function titleRender({ text }: ColumnCustomRenderParams) {
  return (
    <div style={columnStyle.value.keyStyle} title={text}>
      {text}
    </div>
  )
}

function valueRender({ text, record }: ColumnCustomRenderParams) {
  let targetField: any
  Object.keys(props.displayFieldsMap).forEach(layerID => {
    targetField = props.displayFieldsMap[layerID]?.find((item) => {
      return item.title === record.title || item.field === record.title
    })
  })
  const slotName = targetField?.slotName
  const valueCustomRender =
    slotName &&
    (props.customColumnRenders?.[slotName] ||
      componentInstance.parent?.slots[slotName])
  const style = columnStyle.value.valueStyle
  if (valueCustomRender) {
    return (
      <div style={style} title={text}>
        {valueCustomRender({ value: text, style })}
      </div>
    )
  }
  return (
    <div style={style} title={text}>
      {text}
    </div>
  )
}

function registerEvents() {
  viewModel.on('mapselectionchanged', (e: any) => {
    const features = e.features
    if (features[0]) {
      allPopupDatas.value = e.popupInfos
      lnglats.value = e.lnglats
      currentIndex.value = lnglats.value.length - 1
    }
    if (!features[0]) {
      clearPopupData()
    }
    mapSelectionsParams = {
      ...e,
      dataSeletionIndex: currentIndex.value,
      layerName: e.targetId
    }
    activeTargetName.value = e.targetId
    emit('mapselectionchanged', mapSelectionsParams)
  })
}

function handleChange(index: number) {
  currentIndex.value = index
  emit('mapselectionchanged', { ...mapSelectionsParams, dataSeletionIndex: currentIndex.value })
}

function clearPopupData(clear: boolean = true) {
  allPopupDatas.value = []
  lnglats.value = []
  currentIndex.value = 0
  clear && viewModel?.clear()
}

function updateHighlightDatas(data: any) {
  clearPopupData(false)
  viewModel?.updateHighlightDatas(data)
}
defineExpose({ updateHighlightDatas })
</script>
