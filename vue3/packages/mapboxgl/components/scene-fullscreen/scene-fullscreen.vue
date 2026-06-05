<template>
  <div ref="fullscreenRef" class="sm-component-scene-fullscreen">
    <sm-button
      :style="[gisControlHeaderBgStyle, textColorStyle]"
      class="sm-component-scene-fullscreen__content"
      :title="title"
      @click="handleToggleFullscreen"
    >
      <i :class="iconClass"></i>
    </sm-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import type { SceneFullscreenProps } from './types'
import { sceneFullscreenPropsDefault } from './types'
import { useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import SmButton from '@supermapgis/common/components/button/Button'
import { toggleFullscreen } from 'vue-iclient-core/utils/scene'

defineOptions({
  name: 'SmSceneFullscreen'
})

const props = withDefaults(defineProps<SceneFullscreenProps>(), sceneFullscreenPropsDefault)

const { textColorStyle, gisControlHeaderBgStyle } = useTheme(props)
const rootEl = useTemplateRef('fullscreenRef')

onMounted(() => {
  useSceneControl(rootEl.value)
})

function handleToggleFullscreen() {
  if (!props.sceneTarget) {
    return
  }
  const sceneElement = document.getElementById(props.sceneTarget)
  if (!sceneElement) {
    return
  }
  toggleFullscreen(sceneElement);
}
</script>
