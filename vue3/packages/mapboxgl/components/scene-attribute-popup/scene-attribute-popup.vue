<template>
  <BaseAttributePopup
    popup-class="sm-component-scene-attribute-popup"
    :show-popup-tip="showPopupTip"
    :popup-infos="popupInfosForMatch"
    :popup-config="popupConfig"
    :multi-select="multiSelect"
    :background="background"
    :text-color="textColor"
    :color-group="colorGroup"
    :interaction="interaction"
  />
</template>

<script setup lang="ts">
import type { SceneAttributePopupProps } from './types'
import type { SceneHighlightResult } from 'vue-iclient-controllers-mapboxgl/src/SceneHighlightViewModel'
import { computed } from 'vue'
import BaseAttributePopup from '@supermapgis/mapboxgl/components/base-attribute-popup/base-attribute-popup.vue'
import { useLayerHighlightHooks } from './hooks/use-highlight'
import { sceneAttributePopupPropsDefault, toUniqueLayerId } from './types'

defineOptions({
  name: 'SmSceneAttributePopup'
})

const props = withDefaults(defineProps<SceneAttributePopupProps>(), sceneAttributePopupPropsDefault)

const emit = defineEmits<{
  (e: 'selectionchanged', payload: SceneHighlightResult | { features: []; layerIds: [] }): void
  (e: 'querystart', payload: { lngLat: [number, number]; height?: number }): void
  (e: 'queryend', payload: SceneHighlightResult): void
  (e: 'queryfailed', payload: unknown): void
}>()

/** 仅用于与 clickedLayers 内部分组 id 匹配；展示名称仍用 title */
const popupInfosForMatch = computed(() => {
  const list = props.popupInfos || []
  return list.map(info => ({
    ...info,
    layerId: toUniqueLayerId(info, list)
  }))
})

const interaction = useLayerHighlightHooks({
  props,
  onSelectionChanged: payload => emit('selectionchanged', payload),
  onQueryStart: payload => emit('querystart', payload),
  onQueryEnd: payload => emit('queryend', payload),
  onQueryFailed: payload => emit('queryfailed', payload)
})
</script>
