<template>
  <div ref="rootEl" class="sm-component-zoom">
    <div class="sm-component-zoom__buttons" :style="[gisControlHeaderBgStyle, textColorHeadingStyle]">
      <sm-button
        class="sm-component-zoom__button sm-component-zoom__button--zoomin"
        @click="zoomIn"
        @mousedown.prevent="startContinuousZoom('in')"
        @mouseup="clearTimer"
        @mouseleave="clearTimer"
        @touchstart.prevent="startContinuousZoom('in')"
        @touchend="clearTimer"
        @touchcancel="clearTimer"
      >
        <i class="sm-components-icon-plus" />
      </sm-button>
      <div class="sm-component-zoom__button--split" />
      <sm-button
        class="sm-component-zoom__button sm-component-zoom__button--zoomout"
        @click="zoomOut"
        @mousedown.prevent="startContinuousZoom('out')"
        @mouseup="clearTimer"
        @mouseleave="clearTimer"
        @touchstart.prevent="startContinuousZoom('out')"
        @touchend="clearTimer"
        @touchcancel="clearTimer"
      >
        <i class="sm-components-icon-minus" />
      </sm-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SceneZoomProps } from './types'
import { ref, onBeforeUnmount } from 'vue'
import { useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneZoomPropsDefault } from './types'
import { getSceneCameraHeight, getSceneZoomAmount } from './zoom-amount'
import SmButton from '@supermapgis/common/components/button/Button'

defineOptions({
  name: 'SmSceneZoom'
})

const props = withDefaults(defineProps<SceneZoomProps>(), sceneZoomPropsDefault)

const rootEl = ref<HTMLElement | null>(null)
const viewer = ref<any>(null)
let timer: ReturnType<typeof setInterval> | null = null

const { gisControlHeaderBgStyle, textColorHeadingStyle } = useTheme(props)
useSceneControl(rootEl)

useSceneGetter({
  loaded: (sceneViewer: any) => {
    viewer.value = sceneViewer
  },
  removed: () => {
    clearTimer()
    viewer.value = null
  }
})

onBeforeUnmount(() => {
  clearTimer()
})

const getCamera = () => viewer.value?.scene?.camera || viewer.value?.camera

const zoomBy = (direction: 'in' | 'out') => {
  const camera = getCamera()
  if (!camera) {
    return
  }
  const amount = getSceneZoomAmount(getSceneCameraHeight(viewer.value), props.step)
  if (direction === 'in') {
    if (typeof camera.moveForward === 'function') {
      camera.moveForward(amount)
    } else {
      camera.zoomIn?.(amount)
    }
  } else if (typeof camera.moveBackward === 'function') {
    camera.moveBackward(amount)
  } else {
    camera.zoomOut?.(amount)
  }
  viewer.value?.scene?.requestRender?.()
}

const zoomIn = () => {
  zoomBy('in')
}

const zoomOut = () => {
  zoomBy('out')
}

const startContinuousZoom = (direction: 'in' | 'out') => {
  clearTimer()
  timer = setInterval(() => {
    if (direction === 'in') {
      zoomIn()
      return
    }
    zoomOut()
  }, 60)
}

const clearTimer = () => {
  if (!timer) {
    return
  }
  clearInterval(timer)
  timer = null
}
</script>
