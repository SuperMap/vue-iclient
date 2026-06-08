<template>
  <div ref="flyToRef" class="sm-component-scene-fly-to">
    <sm-button
      :style="[gisControlHeaderBgStyle, textColorStyle]"
      class="sm-component-scene-fly-to__content"
      :title="buttonTitle"
      @click="handleFlyTo"
    >
      <i :class="iconClass"></i>
    </sm-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import type { SceneFlyToProps } from './types'
import { sceneFlyToPropsDefault } from './types'
import { useSceneGetter, useLocale, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import SmButton from '@supermapgis/common/components/button/Button'
import { flyToCamera } from 'vue-iclient-core/utils/scene'

defineOptions({
  name: 'SmSceneFlyTo'
})

const props = withDefaults(defineProps<SceneFlyToProps>(), sceneFlyToPropsDefault)

const { t } = useLocale()
const { textColorStyle, gisControlHeaderBgStyle } = useTheme(props)
const buttonTitle = computed(() => props.title || t('flyTo.title'))
const rootEl = useTemplateRef<HTMLElement>('flyToRef')
let viewer = null

useSceneGetter({
  loaded: (sceneViewer: any) => {
    viewer = sceneViewer
  },
  removed: () => {
    viewer = null
  }
})

onMounted(() => {
  useSceneControl(rootEl.value)
})

function handleFlyTo() {
  flyToCamera(viewer, props.destination, props.flyOptions)
}
</script>
