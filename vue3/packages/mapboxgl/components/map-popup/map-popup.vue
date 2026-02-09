<template>
  <div
    v-show="isRender"
    :class="useRichPopup ? 'sm-component-attribute-popup' : 'sm-component-map-popup'"
    ref="Popup"
    :style="[popupBgStyleValue, textColorStyle, popupWidth]"
  >
    <div v-if="useRichPopup" class="content">
      <div class="header">
        <div class="title ellipsis" :title="title">{{ title }}</div>
        <div v-show="showIcon" class="switchDataText">
          <i
            :class="[
              'icon',
              'left-icon',
              'sm-components-icon-solid-triangle-left',
              currentIndex === 0 && 'disabled'
            ]"
            @click="changeIndex(-1)"
          />
          <span :title="paginationContent">{{ paginationContent }}</span>
          <i
            :class="[
              'icon',
              'right-icon',
              'sm-components-icon-solid-triangle-right',
              currentIndex === (lnglats.length || data.length) - 1 && 'disabled'
            ]"
            @click="changeIndex(1)"
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
    >
      <template #header>
        <div class="title ellipsis" :title="title">{{ title }}</div>
        <div v-show="showIcon" class="switchDataText">
          <i
            :class="[
              'icon',
              'left-icon',
              'sm-components-icon-solid-triangle-left',
              currentIndex === 0 && 'disabled'
            ]"
            @click="changeIndex(-1)"
          />
          <span :title="paginationContent">{{ paginationContent }}</span>
          <i
            :class="[
              'icon',
              'right-icon',
              'sm-components-icon-solid-triangle-right',
              currentIndex === (lnglats.length || data.length) - 1 && 'disabled'
            ]"
            @click="changeIndex(1)"
          />
        </div>
      </template>
    </sm-attribute-panel>
  </div>
</template>

<script setup lang="ts">
import type { MapPopupProps, MapPopupEvents } from './types'
import type { PopupConfig } from '@supermapgis/mapboxgl/components/attribute-popup/types'
import type { AttributeRecord } from '@supermapgis/common/components/attribute-panel/types'
import { ref, computed, watch, useTemplateRef, nextTick } from 'vue'
import SmAttributePanel from '@supermapgis/common/components/attribute-panel/attribute-panel.vue'
import PopupContent from '@supermapgis/mapboxgl/components/attribute-popup/popup-content.vue'
import { usePopupConfigHooks } from '@supermapgis/mapboxgl/components/attribute-popup/hooks/use-popup-config'
import { useTheme, useMapGetter } from '@supermapgis/common/hooks/index.common'
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
  return `${currentIndex.value + 1}/${props.lnglats.length || props.data.length}`
})

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
