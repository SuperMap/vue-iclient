<template>
  <BaseAttributePopup
    :popup-infos="popupInfosValue"
    :popup-config="popupConfigValue"
    :multi-select="multiSelect"
    :background="background"
    :text-color="textColor"
    :color-group="colorGroup"
    :interaction="interaction"
  />
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { PopupProps } from './types'
import { computed, ref, watch } from 'vue'
import { useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import BaseAttributePopup from '@supermapgis/mapboxgl/components/base-attribute-popup/base-attribute-popup.vue'
import { useMapAttributePopupInteraction } from './hooks/use-map-interaction'
import { PropsDefault } from './types'

defineOptions({
  name: 'SmAttributePopup'
})

const props = withDefaults(defineProps<PopupProps>(), PropsDefault)

const { popupBgStyle } = useTheme(props)
const mapPopupInfos = ref<any[]>([])

const popupInfosValue = computed(() => {
  const infos = props.useMapPopup ? mapPopupInfos.value : props.popupInfos || []
  return infos.map(item => {
    const newItem = { ...item }
    if (typeof item.layerId === 'string' && item.layerId) {
      newItem.layerId = [item.layerId]
    }
    newItem.layerId = (newItem.layerId || []).filter((id: string) => !id?.includes('-strokeLine'))
    return newItem
  })
})

const popupConfigValue = computed(() => {
  const MSStyle = {
    maxHeight: '394px',
    maxWidth: '280px',
    autoResize: true,
    valueWordWrap: 'wrap'
  }
  return props.useMapPopup ? MSStyle : props.popupConfig || {}
})

const highlightLayerIds = computed(
  () => popupInfosValue.value?.flatMap(item => item.layerId || []) || []
)
const sourceLayers = computed(() => popupInfosValue.value?.map(item => item.layerId || []) || [])

const interaction = useMapAttributePopupInteraction({
  props,
  layerIds: highlightLayerIds,
  sourceLayers,
  popupBgStyle
})

const loaded = (_map: Map, webmap: any) => {
  interaction.removePopup()
  interaction.clear()
  mapPopupInfos.value = webmap.getPopupInfos?.() || []
}

useMapGetter<Map>({ loaded })

watch(
  () => props.useMapPopup,
  () => {
    interaction.removePopup()
    interaction.clear()
  }
)
</script>
