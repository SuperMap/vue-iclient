<template>
  <div
    ref="popupRef"
    v-show="isRender"
    class="sm-component-attribute-popup"
    :style="[textColorStyle, popupBgStyleValue, popupWidth]"
  >
    <SelectLayer
      :show="showSelectLayer"
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
import { ref, computed, reactive, watch, useTemplateRef, nextTick, watchEffect } from 'vue'
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
  removePopup()
  removed()
  mapPopupInfos.value = webmap.getPopupInfos()
  setLayerIds(highlightLayerIds.value, sourceLayers.value)
}

useMapGetter<Map>({ loaded })

const popupInfosValue = computed(() => {
  const infos = props.useMapPopup ? mapPopupInfos.value : props.popupInfos
  return infos.map(item => {
    if (typeof item.layerId === 'string' && item.layerId) {
      item.layerId =[item.layerId]
    }
    // 去除webmap添加的strokeLine图层
    item.layerId = item.layerId.filter(id => !id?.includes('-strokeLine'))
    return item;
  })
})
const popupConfigValue = computed(() => {
  const MSStyle = {
    maxHeight: '394px',
    maxWidth: '280px',
    autoResize: true,
    valueWordWrap: 'wrap'
  }
  const propsPopupConfig: any = props.useMapPopup ? MSStyle : props.popupConfig
  return propsPopupConfig
})
const contentHeight = ref('')

const highlightLayerIds = computed(() => popupInfosValue.value?.flatMap(item => item.layerId) || [])
const sourceLayers = computed(() => popupInfosValue.value?.map(item => item.layerId) || [])

const resizeCallback = () => {
  contentHeight.value = popupContentRef.value?.$el.scrollHeight
    ? popupContentRef.value.$el.scrollHeight + 'px'
    : ''
}
useResizeHooks(popupContentRef, resizeCallback)

const { popupWidth, popupHeight, popupStyle } = usePopupConfigHooks(popupConfigValue, contentHeight)

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
} = useLayerHighlightHooks(props, highlightLayerIds, sourceLayers)

const rootEl = useTemplateRef('popupRef')
const popupProps = reactive({
  coordinates: [],
  rootEl
})
const popupBgStyleValue = computed(() => ({ ...popupBgStyle.value, ...popupStyle.value }))

const { isRender, removePopup } = usePopup(popupProps, popupBgStyleValue)

const currentIndex = ref(0)
const currentLayerId = ref('')
const showSelectLayer = ref(true)
const allPupDatasDisabled = ref([])
const selectedLayers = computed(() => {
  return popupInfosValue.value.filter(item => {
    const isSelectLayer = clickedLayers.value.some(layer => item.layerId.includes(layer.id));
    return isSelectLayer;
  }).map(item => {
    const selectedLayer = clickedLayers.value.find(layer => item.layerId.includes(layer.id));
    return { id: selectedLayer?.id, type: selectedLayer?.type, name: item.title };
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
    popupInfosValue.value?.find(item => item.layerId.includes(currentLayerId.value))?.title ||
    currentLayerId.value
  )
})

watch(
  () => props.useMapPopup,
  () => {
    removePopup()
    removed()
  }
)

watch(lnglats, () => {
  popupProps.coordinates = enableLngLats.value[currentIndex.value]
  currentIndex.value = enableLngLats.value.length ? enableLngLats.value.length - 1 : 0
})

watch(currentIndex, () => {
  popupProps.coordinates = enableLngLats.value[currentIndex.value]
})

watch(
  currentLayerId,
  () => {
    contentHeight.value = ''
  }
)

watchEffect(() => {
  // 如果图层 <= 1 ， 不显示
  if (selectedLayers.value.length <= 1) {
    showSelectLayer.value = false
    return
  }
  // 如果是第二次多选不显示
  if (isMultipleClick.value && isSecMultipleClick.value) {
    showSelectLayer.value = false
    return
  }
  showSelectLayer.value = true
})

const getCurrentLayerId = () => {
  // 如果没有选中
  if (!isSelectLayer.value) {
    return ''
  }
  // 如果第二次多选
  if (isSecMultipleClick.value) {
    return currentLayerId.value
  }
  // 如果单选或第一次多选，图层只有一个
  if (selectedLayers.value.length === 1) {
    return clickedLayers.value[0].id
  }
  // 如果单选或第一次多选，图层有多个
  return ''
}

// 每次新点击
watch(clickedLngLat, newVal => {
  removePopup()
  nextTick(() => {
    currentLayerId.value = getCurrentLayerId()
    if (currentLayerId.value) {
      queryFeaturesByLayerId(currentLayerId.value)
    }
    popupProps.coordinates = isSelectLayer.value ? newVal : null
  })
})

const popupInfo = computed(() => {
  return popupInfosValue.value?.find(item =>item.layerId.includes(currentLayerId.value))
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
  if (!allPopupDatas.value?.length) {
    removePopup()
  }
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
  return props.popupInfos?.find(item => Array.isArray(item.layerId) ? item.layerId.includes(currentLayerId.value) : item.layerId === currentLayerId.value)?.identifyField
})

const changeIndex = (step: number) => {
  if (currentIndex.value + step < 0 || currentIndex.value + step >= enablePopupDatasLength.value) {
    return
  }
  currentIndex.value += step
}

const handleSelect = (id: string) => {
  currentLayerId.value = id
  showSelectLayer.value = false
  queryFeaturesByLayerId(currentLayerId.value)
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
