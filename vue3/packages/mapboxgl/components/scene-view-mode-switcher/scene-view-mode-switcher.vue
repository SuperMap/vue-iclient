<template>
  <div ref="rootEl" class="sm-component-scene-view-mode-switcher">
    <sm-button
      class="sm-component-scene-view-mode-switcher__button"
      :style="[gisControlHeaderBgStyle, textColorHeadingStyle]"
      :title="toggleTitle"
      @click="toogle"
    >
      <span>{{ currentMode }}</span>
    </sm-button>
  </div>
</template>

<script setup lang="ts">
import type { SceneViewModeSwitcherProps } from './types'
import { computed, ref, onBeforeUnmount } from 'vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneViewModeSwitcherPropsDefault } from './types'
import { createSceneViewModeSwitcherController } from 'vue-iclient-core/utils/scene/view-mode-switcher'
import SmButton from '@supermapgis/common/components/button/Button'

defineOptions({
  name: 'SmSceneViewModeSwitcher'
})

const props = withDefaults(defineProps<SceneViewModeSwitcherProps>(), sceneViewModeSwitcherPropsDefault)

const rootEl = ref<HTMLElement | null>(null)
const viewer = ref<any>(null)
const currentMode = ref<'2D' | '3D'>('3D')

const { gisControlHeaderBgStyle, textColorHeadingStyle } = useTheme(props)
const { t } = useLocale()
useSceneControl(rootEl)
const viewModeController = createSceneViewModeSwitcherController({
  getViewer: () => viewer.value,
  getForceScene3D: () => props.forceScene3D,
  getViewMode: () => currentMode.value
})

useSceneGetter({
  loaded: (sceneViewer: any) => {
    viewModeController.clear()
    viewer.value = sceneViewer
    if (props.defaultViewMode === '2D') {
      switchTo2D()
    }
    currentMode.value = props.defaultViewMode || '3D'
  },
  removed: () => {
    viewModeController.clear()
    viewer.value = null
    currentMode.value = '3D'
  }
})

onBeforeUnmount(() => {
  viewModeController.clear()
})

const toggleTitle = computed(() => {
  return currentMode.value === '2D'
    ? t('sceneViewModeSwitcher.switchTo3D')
    : t('sceneViewModeSwitcher.switchTo2D')
})

const toogle = () => {
  if (currentMode.value === '3D') {
    switchTo2D()
    return
  }
  switchTo3D()
}

const switchTo2D = () => {
  if (!viewer.value?.scene?.camera || currentMode.value === '2D') {
    return
  }
  currentMode.value = '2D'
  viewModeController.switchTo2D()
}

const switchTo3D = () => {
  if (!viewer.value?.scene?.camera || currentMode.value === '3D') {
    return
  }
  currentMode.value = '3D'
  viewModeController.switchTo3D()
}
</script>
