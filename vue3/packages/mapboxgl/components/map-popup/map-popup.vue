<template>
  <div
    v-show="isRender"
    ref="Popup"
    :class="useRichPopup ? 'sm-component-attribute-popup' : 'sm-component-map-popup'"
    :style="[popupBgStyleValue, textColorStyle, popupWidth]"
  >
    <div v-if="useRichPopup" class="content">
      <div class="header">
        <div class="title ellipsis" :title="title">{{ title }}</div>
        <div v-show="showIcon" class="switchDataText" :style="paginationDirectionStyle">
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
        <i class="sm-components-icon-close" @click="handleClose" />
      </div>
      <PopupContent
        ref="popupContentRef"
        :data="popupData"
        :popupInfo="popupInfo"
        :popupConfig="popupConfigValue"
        :style="popupHeight"
      />
    </div>
    <sm-attribute-panel
      v-else
      :title="title"
      :showBorder="false"
      :textColor="textColor"
      :background="background"
      :attributes="filterData[currentIndex]"
      :titleRender="titleRender"
      :valueRender="valueRender"
      :showHeader="showHeader"
      :style="panelPopupStyle"
    >
      <template #header>
        <div class="title ellipsis" :title="title">{{ title }}</div>
        <div v-show="showIcon" class="switchDataText" :style="paginationDirectionStyle">
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
      </template>
    </sm-attribute-panel>
  </div>
</template>

<script setup lang="ts">
import type { MapPopupProps, MapPopupEvents } from './types'
import type { PopupConfig } from '@supermapgis/mapboxgl/components/base-attribute-popup/types'
import type { AttributeRecord } from '@supermapgis/common/components/attribute-panel/types'
import { ref, computed, watch, useTemplateRef, nextTick } from 'vue'
import SmAttributePanel from '@supermapgis/common/components/attribute-panel/attribute-panel.vue'
import PopupContent from '@supermapgis/mapboxgl/components/base-attribute-popup/popup-content.vue'
import { usePopupConfigHooks } from '@supermapgis/mapboxgl/components/base-attribute-popup/hooks/use-popup-config'
import { useTheme, useMapGetter } from '@supermapgis/common/hooks/index.common'
import {
  resolveLayoutDirection,
  shouldTransformArabicNumbers,
  toArabicNumber
} from '@supermapgis/common/utils/index.common'
import MapPopupViewModel from 'vue-iclient-controllers-mapboxgl/src/MapPopupViewModel'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { omit } from 'lodash-es'
import { mapPopupPropsDefault } from './types'

defineOptions({
  name: 'SmMapPopup'
})

const props = withDefaults(defineProps<MapPopupProps>(), mapPopupPropsDefault)

const emit = defineEmits<MapPopupEvents>()

const viewModel = new MapPopupViewModel()
const { textColorStyle, popupBgStyle } = useTheme(props)
useMapGetter({ viewModel })

const rootEl = useTemplateRef('Popup')
const popupContentRef = useTemplateRef('popupContentRef')
const currentIndex = ref(props.defaultIndex)
const isRender = ref(false)
const contentHeight = ref('')

const currentCoordinate = computed(() => props.lnglats[currentIndex.value])
const useRichPopup = computed(() => Boolean(props.popupInfo?.elements?.length))

const popupConfigValue = computed(() => {
  return (props.popupConfig || {}) as PopupConfig
})
const { popupWidth, popupHeight, popupStyle } = usePopupConfigHooks(popupConfigValue, contentHeight)
const popupBgStyleValue = computed(() => ({ ...popupBgStyle.value, ...popupStyle.value }))
const panelPopupStyle = computed<Record<string, string>>(() => {
  const { autoResize, maxHeight, height } = popupConfigValue.value
  if (autoResize) {
    return maxHeight ? { '--sm-table-popup-max-height': maxHeight } : {}
  }
  if (!height) {
    return {}
  }
  return {
    '--sm-table-popup-height': height,
    '--sm-table-popup-max-height': height
  }
})

const popupData = computed(() => {
  return props.data[currentIndex.value] || []
})

const filterData = computed(() => {
  return props.data.map(propertyList => {
    return propertyList.map(item => {
      return omit(item, 'slotName') as AttributeRecord
    })
  })
})

const paginationContent = computed(() => {
  const text = `${currentIndex.value + 1}/${props.lnglats.length || props.data.length}`
  return shouldTransformArabicNumbers() ? toArabicNumber(text) : text
})
const isRtl = computed(() => resolveLayoutDirection() === 'rtl')
const maxPageIndex = computed(() => Math.max((props.lnglats.length || props.data.length) - 1, 0))
// 外观与中文一致（左◀ 右▶）；RTL 仅交换翻页语义：左=下一页，右=上一页
const paginationDirectionStyle = { direction: 'ltr', unicodeBidi: 'isolate' } as const
const leftArrowStep = computed(() => (isRtl.value ? 1 : -1))
const rightArrowStep = computed(() => (isRtl.value ? -1 : 1))
const leftArrowDisabled = computed(() =>
  isRtl.value ? currentIndex.value === maxPageIndex.value : currentIndex.value === 0
)
const rightArrowDisabled = computed(() =>
  isRtl.value ? currentIndex.value === 0 : currentIndex.value === maxPageIndex.value
)

const removePopup = () => {
  viewModel.removePopup()
}

const addPopup = () => {
  if (!currentCoordinate.value) return
  isRender.value = true
  viewModel.addPopup(currentCoordinate.value, rootEl.value)
  setPopupArrowStyle(popupBgStyleValue.value.background)
}

const changeIndex = (delta: number) => {
  const maxIndex = Math.max((props.lnglats.length || props.data.length) - 1, 0)
  currentIndex.value = Math.max(0, Math.min(currentIndex.value + delta, maxIndex))
  emit('change', currentIndex.value)
}

const handleClose = () => {
  isRender.value = false
  removePopup()
}

watch(currentCoordinate, () => {
  addPopup()
})

watch(
  [useRichPopup, popupData],
  async ([nextRich]) => {
    if (!nextRich) {
      contentHeight.value = ''
      return
    }
    await nextTick()
    const el = popupContentRef.value?.$el as HTMLElement | undefined
    contentHeight.value = el?.scrollHeight ? `${el.scrollHeight}px` : ''
  },
  {
    immediate: true,
    deep: true
  }
)

watch(
  () => props.defaultIndex,
  newIndex => {
    currentIndex.value = newIndex
  }
)

watch(popupBgStyleValue, () => {
  setPopupArrowStyle(popupBgStyleValue.value.background)
})

watch(
  () => props.data,
  newData => {
    if (!newData.length) {
      removePopup()
    }
  }
)
</script>
