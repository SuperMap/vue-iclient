<template>
  <div
    v-show="isRender"
    class="sm-component-map-popup"
    ref="Popup"
    :style="[popupBgStyle, textColorStyle]"
  >
    <sm-attribute-panel
      :title="title"
      :showBorder="false"
      :textColor="textColor"
      :background="background"
      :attributes="filterData[defaultIndex]"
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
import type { AttributeRecord } from '@supermapgis/common/components/attribute-panel/types'
import { ref, computed, watch, useTemplateRef } from 'vue'
import SmAttributePanel from '@supermapgis/common/components/attribute-panel/attribute-panel.vue'
import { useTheme, useMapGetter } from '@supermapgis/common/hooks/index.common'
import MapPopupViewModel from 'vue-iclient-core/controllers/mapboxgl/MapPopupViewModel'
import { setPopupArrowStyle } from 'vue-iclient-core/utils/util'
import { omit } from 'lodash-es'
import { mapPopupPropsDefault } from './types'

defineOptions({
  name: 'SmMapPopup',
  inheritAttrs: false
})

const props = withDefaults(defineProps<MapPopupProps>(), mapPopupPropsDefault)

const emit = defineEmits<MapPopupEvents>()

const viewModel = new MapPopupViewModel()
const { textColorStyle, popupBgStyle } = useTheme(props)
useMapGetter({ viewModel })

const rootEl = useTemplateRef('Popup')
const currentIndex = ref(props.defaultIndex)
const isRender = ref(false)

const currentCoordinate = computed(() => props.lnglats[currentIndex.value])

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
  setPopupArrowStyle(popupBgStyle.value.background)
}

const changeIndex = (delta: number) => {
  currentIndex.value += delta
  if (currentIndex.value < 0) {
    currentIndex.value = 0
  }
  emit('change', currentIndex.value)
}

watch(currentCoordinate, () => {
  addPopup()
})

watch(
  () => props.defaultIndex,
  newIndex => {
    currentIndex.value = newIndex
  }
)

watch(popupBgStyle, () => {
  setPopupArrowStyle(popupBgStyle.value.background)
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
