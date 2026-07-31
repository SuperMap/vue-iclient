<template>
  <BaseAttributePopup
    popup-class="sm-component-scene-attribute-popup"
    :show-popup-tip="showPopupTip"
    :popup-infos="normalizedPopupInfos"
    :popup-config="popupConfig"
    :multi-select="multiSelect"
    :background="background"
    :text-color="textColor"
    :color-group="colorGroup"
    :interaction="interaction"
  />
</template>

<script setup lang="ts">
import type { SceneAttributePopupProps, ScenePopupInfo } from './types'
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

/** 同一 overlay layerId 挂多个 dataset 时，归一成唯一 layerId，便于图层选择与结果分组 */
const normalizedPopupInfos = computed<ScenePopupInfo[]>(() =>
  (props.popupInfos || []).map(info => ({
    ...info,
    layerId: toUniqueLayerId(info)
  }))
)

const interaction = useLayerHighlightHooks({
  props,
  onSelectionChanged: payload => emit('selectionchanged', payload),
  onQueryStart: payload => emit('querystart', payload),
  onQueryEnd: payload => emit('queryend', payload),
  onQueryFailed: payload => emit('queryfailed', payload)
})
</script>
