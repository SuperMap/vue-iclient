<template>
  <BaseAttributePopup
    popup-class="sm-component-scene-attribute-popup"
    :show-popup-tip="showPopupTip"
    :popup-infos="popupInfos"
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
import BaseAttributePopup from '@supermapgis/mapboxgl/components/base-attribute-popup/base-attribute-popup.vue'
import { useLayerHighlightHooks } from './hooks/use-highlight'
import { sceneAttributePopupPropsDefault } from './types'

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

const interaction = useLayerHighlightHooks({
  props,
  onSelectionChanged: payload => emit('selectionchanged', payload),
  onQueryStart: payload => emit('querystart', payload),
  onQueryEnd: payload => emit('queryend', payload),
  onQueryFailed: payload => emit('queryfailed', payload)
})
</script>
