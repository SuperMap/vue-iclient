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
import type { ViewMode, ViewModeSwitcherChangeEvent } from 'vue-iclient-core/utils/scene'
import type { SceneViewModeSwitcherProps } from './types'
import { computed, ref, onBeforeUnmount } from 'vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneViewModeSwitcherPropsDefault } from './types'
import { ViewModeSwitcher } from 'vue-iclient-core/utils/scene'
import SmButton from '@supermapgis/common/components/button/Button'

defineOptions({
  name: 'SmSceneViewModeSwitcher'
})

const props = withDefaults(defineProps<SceneViewModeSwitcherProps>(), sceneViewModeSwitcherPropsDefault)

const rootEl = ref<HTMLElement | null>(null)
const viewer = ref<any>(null)
const currentMode = ref<ViewMode>(normalizeViewMode(props.defaultViewMode))
const viewModeController = ref<ViewModeSwitcher | null>(null)

const { gisControlHeaderBgStyle, textColorHeadingStyle } = useTheme(props)
const { t } = useLocale()
useSceneControl(rootEl)

const handleModeChange = (event: ViewModeSwitcherChangeEvent) => {
  currentMode.value = event.currentMode
}

useSceneGetter({
  loaded: (sceneViewer: any) => {
    destroyViewModeController()
    viewer.value = sceneViewer
    viewModeController.value = new ViewModeSwitcher({
      viewer: sceneViewer,
      forceScene3D: props.forceScene3D,
      defaultViewMode: '3D'
    })
    currentMode.value = viewModeController.value.currentMode
    viewModeController.value.on({ change: handleModeChange })
    applyViewMode(normalizeViewMode(props.defaultViewMode))
  },
  removed: () => {
    destroyViewModeController()
    viewer.value = null
    currentMode.value = normalizeViewMode(props.defaultViewMode)
  }
})

onBeforeUnmount(() => {
  destroyViewModeController()
})

const toggleTitle = computed(() => {
  return currentMode.value === '2D'
    ? t('sceneViewModeSwitcher.switchTo3D')
    : t('sceneViewModeSwitcher.switchTo2D')
})

const toogle = () => {
  if (!viewer.value?.scene?.camera || !viewModeController.value) {
    return
  }
  viewModeController.value.toggle()
}

function applyViewMode(mode: ViewMode) {
  if (!viewer.value?.scene?.camera || !viewModeController.value) {
    return
  }
  if (mode === '2D') {
    viewModeController.value.switchTo2D()
    return
  }
  viewModeController.value.switchTo3D()
}

function normalizeViewMode(mode?: string): ViewMode {
  return mode === '2D' ? '2D' : '3D'
}

function destroyViewModeController() {
  if (!viewModeController.value) {
    return
  }
  viewModeController.value.un({ change: handleModeChange })
  viewModeController.value.clear()
  viewModeController.value = null
}
</script>
