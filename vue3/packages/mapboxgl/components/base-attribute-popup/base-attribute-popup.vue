<template>
  <div
    ref="popupRef"
    v-show="interaction.isRender.value"
    :class="[
      'sm-component-attribute-popup',
      popupClass,
      showPopupTip && 'has-popup-tip',
      interactionRootClass
    ]"
    :style="[textColorStyle, popupBgStyleValue, popupWidth, interactionRootStyleMerged]"
  >
    <div v-if="showPopupTip" class="popup-tip" />
    <SelectLayer
      :show="showSelectLayer"
      :layerInfos="selectedLayers"
      @select="handleSelect"
      @close="handleClose"
    />
    <div v-show="showPopupContent" class="content">
      <div class="header">
        <i v-show="canReturn" class="sm-components-icon-left" @click="handleReturn" />
        <div class="title ellipsis" :title="currentLayerName">{{ currentLayerName }}</div>
        <div v-show="showPagination" class="switchDataText" :style="paginationDirectionStyle">
          <i
            :class="[
              'icon',
              'left-icon',
              'sm-components-icon-solid-triangle-left',
              leftArrowDisabled && 'disabled'
            ]"
            @click="changeIndex(leftArrowStep)"
          />
          <span :title="paginationContent">{{ paginationContent }}</span>
          <i
            :class="[
              'icon',
              'right-icon',
              'sm-components-icon-solid-triangle-right',
              rightArrowDisabled && 'disabled'
            ]"
            @click="changeIndex(rightArrowStep)"
          />
        </div>
        <Dropdown v-if="showIdentifyFields" class="identify-fields">
          <a class="ant-dropdown-link" @click.prevent>
            <MenuUnfoldOutlined />
          </a>
          <template #overlay>
            <Menu>
              <MenuItem v-for="(item, index) in identifyFieldsOptions" :key="item.value">
                <Checkbox
                  v-model:checked="item.checked"
                  @change="e => handleCheckedChange(e, index)"
                >
                  {{ item.label }}
                </Checkbox>
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>
        <i class="sm-components-icon-close" @click="handleClose" />
      </div>
      <PopupContent
        ref="popupContentRef"
        :data="data"
        :features-data="enablePopupDatas"
        :index="currentIndex"
        :popupInfo="popupInfo"
        :popupConfig="popupConfigValue"
        :event="popupEvent"
        :style="popupHeight"
      />
    </div>
  </div>
  
</template>

<script setup lang="ts">
import type { PopupInfo, PopupFieldItem, BaseAttributePopupProps } from './types'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch, watchEffect } from 'vue'
import { Checkbox, Dropdown, Menu, MenuItem } from 'ant-design-vue'
import { MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useTheme } from '@supermapgis/common/hooks/index.common'
import {
  resolveLayoutDirection,
  shouldTransformArabicNumbers,
  toArabicNumber
} from '@supermapgis/common/utils/index.common'
import PopupContent from './popup-content.vue'
import { usePopupConfigHooks, mergePopupMaxHeight } from './hooks/use-popup-config'
import SelectLayer from './select-layer.vue'
import { useResizeHooks } from './hooks/use-resize'
import { baseAttributePopupPropsDefault } from './types'

defineOptions({
  name: 'SmBaseAttributePopup'
})

const props = withDefaults(defineProps<BaseAttributePopupProps>(), baseAttributePopupPropsDefault)

const { textColorStyle, popupBgStyle } = useTheme(props)
const interaction = computed(() => props.interaction)

const popupContentRef = useTemplateRef('popupContentRef')
const rootEl = useTemplateRef('popupRef')

const currentIndex = ref(0)
const currentLayerId = ref('')
const showSelectLayer = ref(false)
const allPupDatasDisabled = ref<boolean[]>([])
const identifyFieldsOptions = ref<Array<{ label: any; value: any; checked: boolean }>>([])
const contentHeight = ref('')

const popupInfosValue = computed(() => {
  return (props.popupInfos || []).map(item => {
    const next = { ...item }
    if (typeof item.layerId === 'string' && item.layerId) {
      next.layerId = [item.layerId]
    }
    if (Array.isArray(next.layerId)) {
      next.layerId = next.layerId.filter(id => !id?.includes('-strokeLine'))
    }
    return next
  })
})

const popupConfigValue = computed(() => props.popupConfig || {})
const { popupWidth, popupHeight, popupStyle } = usePopupConfigHooks(popupConfigValue, contentHeight)
const popupBgStyleValue = computed(() => ({ ...popupBgStyle.value, ...popupStyle.value }))
const interactionRootStyle = computed(() => interaction.value.rootStyle?.value || {})
const interactionRootClass = computed(() => interaction.value.rootClass?.value || '')
/**
 * 场景贴边会给根节点写 maxHeight，并配合 popup-height-constrained 清掉内容区 max-height。
 * 这里与 popupConfig.maxHeight 取更小值，保证配置限高仍然生效。
 */
const interactionRootStyleMerged = computed(() => {
  const rootStyle = { ...(interactionRootStyle.value || {}) }
  if (!rootStyle.maxHeight) {
    return rootStyle
  }
  const configMaxHeight =
    popupConfigValue.value.autoResize === false
      ? popupConfigValue.value.height
      : popupConfigValue.value.maxHeight
  const mergedMaxHeight = mergePopupMaxHeight(configMaxHeight, rootStyle.maxHeight as string)
  if (mergedMaxHeight) {
    rootStyle.maxHeight = mergedMaxHeight
  }
  return rootStyle
})

const highlightLayerIds = computed(
  () => popupInfosValue.value?.flatMap(item => (item.layerId as string[]) || []) || []
)
const sourceLayers = computed(() => popupInfosValue.value?.map(item => item.layerId as string[]) || [])

watch(
  highlightLayerIds,
  ids => {
    interaction.value.setLayerIds?.(ids, sourceLayers.value)
  },
  { immediate: true }
)

const resizeCallback = () => {
  contentHeight.value = popupContentRef.value?.$el?.scrollHeight
    ? `${popupContentRef.value.$el.scrollHeight}px`
    : ''
}
useResizeHooks(popupContentRef, resizeCallback)

onMounted(() => {
  interaction.value.bindRootEl?.(rootEl.value as HTMLElement)
})

watch(rootEl, el => {
  interaction.value.bindRootEl?.(el as HTMLElement)
})

const selectedLayers = computed(() => {
  const matched = popupInfosValue.value
    .filter(item =>
      interaction.value.clickedLayers.value.some(layer =>
        (item.layerId as string[])?.includes(layer.id)
      )
    )
    .map(item => {
      const selectedLayer = interaction.value.clickedLayers.value.find(layer =>
        (item.layerId as string[])?.includes(layer.id)
      )
      return {
        id: selectedLayer?.id,
        type: selectedLayer?.type || 'fill',
        name: item.title || selectedLayer?.name || selectedLayer?.id
      }
    })
  if (matched.length) {
    return matched
  }
  // 无 popupInfos 配置时，直接使用交互层回传的命中图层
  return interaction.value.clickedLayers.value.map(layer => ({
    id: layer.id,
    type: layer.type || 'fill',
    name: layer.name || layer.id
  }))
})

const showPopupContent = computed(() => Boolean(!showSelectLayer.value && currentLayerId.value))
const canReturn = computed(() => selectedLayers.value.length > 1)
const isSelectLayer = computed(() => interaction.value.clickedLayers.value.length > 0)

const currentLayerName = computed(() => {
  return (
    popupInfosValue.value?.find(item =>
      (item.layerId as string[])?.includes(currentLayerId.value)
    )?.title || currentLayerId.value
  )
})

const popupInfo = computed<PopupInfo>(() => {
  const configured = popupInfosValue.value?.find(item =>
    (item.layerId as string[])?.includes(currentLayerId.value)
  )
  // 有 elements 时走配置
  if (configured?.elements?.length) {
    return {
      ...configured,
      title: configured.title || currentLayerName.value,
      layerId: configured.layerId || [currentLayerId.value]
    }
  }
  const featureData = enablePopupDatas.value[currentIndex.value] || []
  const properties = featureData.reduce((acc: Record<string, any>, item: PopupFieldItem) => {
    acc[item.title] = item.value
    return acc
  }, {})
  return {
    title: currentLayerName.value,
    layerId: [currentLayerId.value],
    elements: Object.keys(properties).map(fieldName => ({
      type: 'FIELD' as const,
      fieldName,
      fieldCaption: fieldName,
      contentType: 'text' as const
    }))
  }
})

const popupEvent = computed(() => {
  const lngLat = interaction.value.clickedLngLat.value
  const extra = interaction.value.clickEvent?.value || {}
  return {
    lngLat,
    ...extra
  }
})

const enablePopupDatas = computed(() => {
  return (
    interaction.value.allPopupDatas.value?.filter(
      (_item, index) => !allPupDatasDisabled.value[index]
    ) || []
  )
})
const enablePopupDatasLength = computed(() => enablePopupDatas.value?.length || 0)
const enableLngLats = computed(() => {
  return (
    interaction.value.lnglats.value?.filter((_item, index) => !allPupDatasDisabled.value[index]) ||
    []
  )
})
const data = computed(() => enablePopupDatas.value[currentIndex.value] || [])
const isRtl = computed(() => resolveLayoutDirection() === 'rtl')
// 外观与中文一致（左◀ 右▶）；RTL 仅交换翻页语义：左=下一页，右=上一页
const paginationDirectionStyle = { direction: 'ltr', unicodeBidi: 'isolate' } as const
const leftArrowStep = computed(() => (isRtl.value ? 1 : -1))
const rightArrowStep = computed(() => (isRtl.value ? -1 : 1))
const leftArrowDisabled = computed(() =>
  isRtl.value
    ? currentIndex.value === enablePopupDatasLength.value - 1
    : currentIndex.value === 0
)
const rightArrowDisabled = computed(() =>
  isRtl.value
    ? currentIndex.value === 0
    : currentIndex.value === enablePopupDatasLength.value - 1
)
const paginationContent = computed(() => {
  const text = `${currentIndex.value + 1}/${enablePopupDatasLength.value}`
  // RTL：页码数字转阿拉伯字形
  return shouldTransformArabicNumbers() ? toArabicNumber(text) : text
})
const showPagination = computed(
  () =>
    enablePopupDatasLength.value > 1 ||
    (interaction.value.isMultipleClick.value && enablePopupDatasLength.value > 0)
)
const identifyField = computed(() => {
  return popupInfosValue.value?.find(item =>
    Array.isArray(item.layerId)
      ? item.layerId.includes(currentLayerId.value)
      : item.layerId === currentLayerId.value
  )?.identifyField
})
const showIdentifyFields = computed(
  () => interaction.value.isMultipleClick.value && identifyFieldsOptions.value.length > 0
)

watchEffect(() => {
  if (selectedLayers.value.length <= 1) {
    showSelectLayer.value = false
    return
  }
  if (interaction.value.isMultipleClick.value && interaction.value.isSecMultipleClick.value) {
    showSelectLayer.value = false
    return
  }
  showSelectLayer.value = true
})

const getCurrentLayerId = () => {
  if (!isSelectLayer.value) {
    return ''
  }
  if (interaction.value.isSecMultipleClick.value) {
    return currentLayerId.value
  }
  if (selectedLayers.value.length === 1) {
    return interaction.value.clickedLayers.value[0].id
  }
  return ''
}

watch(
  () => interaction.value.clickedLngLat.value,
  newVal => {
    interaction.value.removePopup()
    nextTick(() => {
      currentLayerId.value = getCurrentLayerId()
      if (currentLayerId.value) {
        interaction.value.queryFeaturesByLayerId(currentLayerId.value)
      }
      // 地图挂载坐标；场景交互内部自行处理定位
      syncPopupCoordinate(isSelectLayer.value ? newVal : null)
    })
  }
)

watch(enableLngLats, () => {
  syncPopupCoordinate(enableLngLats.value[currentIndex.value])
  currentIndex.value = enableLngLats.value.length ? enableLngLats.value.length - 1 : 0
})

watch(currentIndex, () => {
  syncPopupCoordinate(enableLngLats.value[currentIndex.value])
})

watch(currentLayerId, () => {
  contentHeight.value = ''
})

watch(enablePopupDatasLength, () => {
  if (currentIndex.value >= enablePopupDatasLength.value) {
    currentIndex.value = Math.max(enablePopupDatasLength.value - 1, 0)
  }
  if (enablePopupDatasLength.value === 0) {
    currentIndex.value = 0
  }
})

watch(
  () => interaction.value.allPopupDatas.value,
  () => {
    const allPopupDatas = interaction.value.allPopupDatas.value
    if (!allPopupDatas?.length && !showSelectLayer.value) {
      interaction.value.removePopup()
    }
    allPupDatasDisabled.value =
      allPopupDatas?.map((_item, index) => allPupDatasDisabled.value[index] || false) || []
    identifyFieldsOptions.value = identifyField.value
      ? allPopupDatas?.map((row, index) => {
          const item = row.find(cell => cell.title === identifyField.value)
          return {
            label: item?.value,
            value: item?.value,
            checked: !allPupDatasDisabled.value[index]
          }
        }) || []
      : []
  }
)

function syncPopupCoordinate(coordinate: any) {
  interaction.value.setPopupCoordinates(coordinate)
}

function handleSelect(id: string) {
  currentLayerId.value = id
  showSelectLayer.value = false
  currentIndex.value = 0
  interaction.value.queryFeaturesByLayerId(currentLayerId.value)
}

function handleClose() {
  showSelectLayer.value = false
  currentLayerId.value = ''
  currentIndex.value = 0
  allPupDatasDisabled.value = []
  interaction.value.removePopup()
  interaction.value.clear()
}

function handleReturn() {
  showSelectLayer.value = true
  currentLayerId.value = ''
  currentIndex.value = 0
  if (interaction.value.returnToLayerSelect) {
    interaction.value.returnToLayerSelect()
    return
  }
  interaction.value.removePopup()
  interaction.value.clear()
}

function changeIndex(step: number) {
  const next = currentIndex.value + step
  if (next < 0 || next >= enablePopupDatasLength.value) {
    return
  }
  currentIndex.value = next
}

function handleCheckedChange(e: any, index: number) {
  const values = identifyFieldsOptions.value.filter(item => item.checked).map(item => item.value)
  interaction.value.setHighlightLayerFilter(currentLayerId.value, {
    field: identifyField.value as string,
    values
  })
  allPupDatasDisabled.value[index] = !e.target.checked
}

defineExpose({
  rootEl,
  handleClose
})
</script>
