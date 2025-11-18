<template>
  <div
    ref="popupRef"
    v-show="isRender"
    class="sm-component-attribute-popup"
    :style="[textColorStyle, popupBgStyle, popupWidth]"
  >
    <SelectLayer
      :show="showSelectLayer && isSelectLayer"
      :layerInfos="selectedLayers"
      @select="handleSelect"
      @close="handleClose"
    />
    <div v-show="showPopupContent" class="content">
      <div class="header">
        <i v-show="currentIndex === 0" class="sm-components-icon-left" @click="handleReturn()"></i>
        <div class="title ellipsis" :title="currentLayerName">{{ currentLayerName }}</div>
        <!-- 翻页 -->
        <div v-show="isMultipleClick && enablePopupDatasLength > 0" class="switchDataText">
          <i
            :class="[
              'icon',
              'left-icon',
              'sm-components-icon-solid-triangle-left',
              currentIndex === 0 && 'disabled'
            ]"
            type="caret-left"
            @click="changeIndex(-1)"
          />
          <span :title="paginationContent">{{ paginationContent }}</span>
          <i
            type="caret-right"
            :class="[
              'icon',
              'right-icon',
              'sm-components-icon-solid-triangle-right',
              currentIndex === enablePopupDatasLength - 1 && 'disabled'
            ]"
            @click="changeIndex(1)"
          />
        </div>
        <!-- 标识字段 -->
        <Dropdown v-if="isMultipleClick && identifyFieldsOptions.length" class="identify-fields">
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
        <i class="sm-components-icon-close" @click="handleClose()"></i>
      </div>
      <PopupContent
        ref="popupContentRef"
        :data="data"
        :popupInfo="popupInfo"
        :popupConfig="popupConfigValue"
        :style="popupHeight"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { PopupProps } from './types'
import { ref, computed, reactive, watch, useTemplateRef, nextTick } from 'vue'
import { Dropdown, Checkbox, Menu, MenuItem } from 'ant-design-vue'
import { MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { PropsDefault } from './types'
import PopupContent from './popup-content.vue'
import SelectLayer from './select-layer.vue'
import { useTheme, useMapGetter } from '@supermapgis/common/hooks/index.common'
import { usePopup } from './hooks/use-popup'
import { useLayerHighlightHooks } from './hooks/use-highlight'
import { usePopupConfigHooks } from './hooks/use-popup-config'
import { useResizeHooks } from './hooks/use-resize'

const props = withDefaults(defineProps<PopupProps>(), PropsDefault)

const { textColorStyle, popupBgStyle } = useTheme(props)

const mapPopupInfos = ref([])
const popupContentRef = useTemplateRef('popupContentRef')

const loaded = (map: Map, webmap) => {
  mapPopupInfos.value = webmap.getPopupInfos()
  setLayerIds(highlightLayerIds.value)
}

useMapGetter<Map>({ loaded })

const popupInfosValue = computed(() => {
  return props.useMapPopup ? mapPopupInfos.value : props.popupInfos
})
const popupConfigValue = computed(() => {
  const MSStyle = {
    maxHeight: '394px',
    maxWidth: '280px',
    autoResize: true
  }
  const propsPopupConfig: any = props.useMapPopup ? MSStyle : props.popupConfig
  return propsPopupConfig
})
const contentHeight = ref('')

const highlightLayerIds = computed(() => popupInfosValue.value?.map(item => item.id) || [])

const resizeCallback = () => {
  contentHeight.value = popupContentRef.value?.$el.scrollHeight
    ? popupContentRef.value.$el.scrollHeight + 'px'
    : ''
}
useResizeHooks(popupContentRef, resizeCallback)

const { popupWidth, popupHeight } = usePopupConfigHooks(popupConfigValue, contentHeight)

const {
  isMultipleClick,
  isSecMultipleClick,
  clickedLngLat,
  clickedLayers,
  lnglats,
  allPopupDatas,
  setLayerIds,
  queryFeaturesByLayerId,
  setHighlightLayerFilter,
  removed
} = useLayerHighlightHooks(props, highlightLayerIds)

const rootEl = useTemplateRef('popupRef')
const popupProps = reactive({
  coordinates: [],
  popupBgStyle,
  rootEl
})
const { isRender, removePopup } = usePopup(popupProps)

const currentIndex = ref(0)
const currentLayerId = ref('')
const showSelectLayer = ref(true)
const allPupDatasDisabled = ref([])
const selectedLayers = computed(() => {
  return clickedLayers.value.map(item => {
    const { id, type } = item
    const name = popupInfosValue.value?.find(item => item.id === id)?.title
    return { id, type, name }
  })
})
const showPopupContent = computed(() => {
  return Boolean(!showSelectLayer.value && currentLayerId.value)
})

// 是否选中图层
const isSelectLayer = computed(() => {
  return clickedLayers.value.length > 0
})

const currentLayerName = computed(() => {
  return (
    popupInfosValue.value?.find(item => item.id === currentLayerId.value)?.title ||
    currentLayerId.value
  )
})

const removeAll = () => {
  removed()
  removePopup()
}

watch(lnglats, () => {
  popupProps.coordinates = enableLngLats.value[currentIndex.value]
  currentIndex.value = enableLngLats.value.length ? enableLngLats.value.length - 1 : 0
})

watch(currentIndex, () => {
  popupProps.coordinates = enableLngLats.value[currentIndex.value]
})

watch(clickedLayers, () => {
  if (!isSelectLayer.value) {
    currentLayerId.value = ''
    removeAll()
  }
})
watch(currentLayerId, newVal => {
  if (newVal) {
    queryFeaturesByLayerId(newVal)
  }
})
// 每次新点击
watch(clickedLngLat, (newVal, oldVal) => {
  showSelectLayer.value = false
  const oldLayerId = currentLayerId.value
  currentLayerId.value = ''
  if (!isMultipleClick.value) {
    removeAll()
  }
  nextTick(() => {
    if (isSecMultipleClick.value) {
      currentLayerId.value = oldLayerId
      queryFeaturesByLayerId(currentLayerId.value)
    }
    popupProps.coordinates = isSelectLayer.value ? newVal : null
    showSelectLayer.value = !isSecMultipleClick.value
  })
})

const popupInfo = computed(() => {
  return popupInfosValue.value?.find(item => item.id === currentLayerId.value)
})
const paginationContent = computed(() => {
  return `${currentIndex.value + 1}/${enablePopupDatasLength.value}`
})

const enablePopupDatas = computed(() => {
  return allPopupDatas.value?.filter((item, index) => !allPupDatasDisabled.value[index])
})
const enablePopupDatasLength = computed(() => {
  return enablePopupDatas.value?.length || 0
})

const enableLngLats = computed(() => {
  return lnglats.value?.filter((item, index) => !allPupDatasDisabled.value[index])
})

const data = computed(() => {
  return enablePopupDatas.value[currentIndex.value] || []
})

watch(enablePopupDatasLength, () => {
  if (currentIndex.value >= enablePopupDatasLength.value) {
    currentIndex.value = enablePopupDatasLength.value - 1
  }
  if (enablePopupDatasLength.value === 0) {
    currentIndex.value = 0
  }
})
const identifyFieldsOptions = ref([])

watch(allPopupDatas, () => {
  allPupDatasDisabled.value =
    allPopupDatas.value?.map((item, index) => allPupDatasDisabled.value[index] || false) || []
  identifyFieldsOptions.value = identifyField.value
    ? allPopupDatas.value?.map((data, index) => {
        const item = data.find(item => item.title === identifyField.value)
        return { label: item.value, value: item.value, checked: !allPupDatasDisabled.value[index] }
      })
    : []
})
const identifyField = computed(() => {
  return props.popupInfos?.find(item => item.id === currentLayerId.value)?.identifyField
})

const changeIndex = (step: number) => {
  currentIndex.value += step
}

const handleSelect = (id: string) => {
  currentLayerId.value = id
  showSelectLayer.value = false
}

const handleClose = () => {
  showSelectLayer.value = false
  currentLayerId.value = ''
  removePopup()
  removed()
}

const handleReturn = () => {
  showSelectLayer.value = true
  currentLayerId.value = ''
  removed()
}
const handleCheckedChange = (e: any, index: any) => {
  const values = identifyFieldsOptions.value.filter(item => item.checked).map(item => item.value)
  setHighlightLayerFilter(currentLayerId.value, { field: identifyField.value, values })
  allPupDatasDisabled.value[index] = !e.target.checked
}
</script>
