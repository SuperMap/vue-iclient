<template>
  <div ref="fullscreenRef" class="sm-component-scene-fullscreen">
    <sm-button
      :style="[gisControlHeaderBgStyle, textColorStyle]"
      class="sm-component-scene-fullscreen__content"
      :title="buttonTitle"
      @click="handleToggleFullscreen"
    >
      <i :class="iconClass"></i>
    </sm-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue'
import type { SceneFullscreenProps } from './types'
import { sceneFullscreenPropsDefault } from './types'
import { useLocale, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import SmButton from '@supermapgis/common/components/button/Button'
import { toggleFullscreen } from 'vue-iclient-core/utils/scene'

defineOptions({
  name: 'SmSceneFullscreen'
})

const props = withDefaults(defineProps<SceneFullscreenProps>(), sceneFullscreenPropsDefault)

const { t } = useLocale()
const { textColorStyle, gisControlHeaderBgStyle } = useTheme(props)
const buttonTitle = computed(() => props.title || t('sceneFullscreen.title'))
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
  // 低代码运行时中场景作为容器渲染时，场景内部的子组件并不挂在场景元素上，
  // 而是与场景元素并列渲染在外层包裹容器中（见 DragContainer.vue 的
  // web-scene-container / web-map-container 结构）。若只对场景元素全屏，
  // 场景内的子组件不会显示，因此优先取包含场景和子组件的包裹容器作为全屏对象。
  const containerElement = sceneElement.closest('.web-scene-container')
  toggleFullscreen(containerElement ?? sceneElement);
}
</script>
