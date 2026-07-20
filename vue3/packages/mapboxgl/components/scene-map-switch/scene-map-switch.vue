<template>
  <SmCollapseCard
    v-show="isShow"
    icon-class="sm-components-icon-layer-list"
    :icon-position="position"
    :header-name="t('sceneMapSwitch.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-scene-map-switch"
    ref="mapSwitchRef"
  >
    <SmCard
      class="sm-component-scene-map-switch__panel"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-map-switch__content">
        <div
          v-for="(item, index) in displayBaseMapLayers"
          :key="index"
          :class="[
            'sm-component-scene-map-switch__layer-item',
            { 'is-active': currentIndex === index }
          ]"
          @click="switchTo(index)"
        >
          <div class="sm-component-scene-map-switch__layer-preview">
            <img :src="item.image || DEFAULT_THUMBNAIL" :alt="item.label" />
            <div class="sm-component-scene-map-switch__layer-name" :title="item.label">
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
    </SmCard>
    <div v-if="annotation || terrain" class="sm-component-scene-map-switch__footer">
      <div v-if="annotation" class="sm-component-scene-map-switch__footer-item">
        <label>{{ t('sceneMapSwitch.annotation') }}</label>
        <SmSwitch v-model:checked="isShowNameLabel" size="small" />
      </div>
      <div v-if="terrain" class="sm-component-scene-map-switch__footer-item">
        <label>{{ t('sceneMapSwitch.terrain') }}</label>
        <SmSwitch v-model:checked="isShowTerrain" size="small" />
      </div>
    </div>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import type { MapSwitchChangeEvent } from 'vue-iclient-core/utils/scene/map-switch'
import type { BaseMapLayerConfig, SceneMapSwitchProps } from './types'
import { computed, useTemplateRef, ref, onBeforeUnmount, watch } from 'vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneMapSwitchPropsDefault } from './types'
import { MapSwitch } from 'vue-iclient-core/utils/scene/map-switch'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSwitch from '@supermapgis/common/components/switch/Switch'

defineOptions({
  name: 'SmSceneMapSwitch'
})

const DEFAULT_THUMBNAIL = new URL('./assets/defaultThumbnail.png', import.meta.url).href

const props = withDefaults(defineProps<SceneMapSwitchProps>(), sceneMapSwitchPropsDefault)

const hasOriginalBaseLayer = ref(false)
const currentIndex = ref<number | undefined>(undefined)
const isShowNameLabel = ref(false)
const isShowTerrain = ref(false)
let mapSwitchController: MapSwitch | null = null
const isShow = ref(true)

const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const rootEl = useTemplateRef('mapSwitchRef')
useSceneControl(() => rootEl.value?.$el)

const baseMapLayersValue = computed(() => props.baseMapLayers.map(item => item.layer))

/** UI 展示列表：有原始底图时第 0 项为 Original + 原始底图 */
const displayBaseMapLayers = computed<BaseMapLayerConfig[]>(() => {
  const layers = props.baseMapLayers ?? []
  if (!hasOriginalBaseLayer.value) {
    return layers
  }
  return [
    {
      label: t('sceneMapSwitch.original'),
      image: DEFAULT_THUMBNAIL,
      layer: { type: 'Original' }
    },
    ...layers
  ]
})

watch(
  () => baseMapLayersValue.value,
  newMaps => {
    if (mapSwitchController) {
      mapSwitchController.setBaseMapLayers(newMaps ?? [])
    }
  },
  { deep: true }
)

watch(isShowNameLabel, enabled => {
  if (!mapSwitchController) return
  mapSwitchController.setAnnotation(enabled ? (props.annotation ?? null) : null)
})

watch(
  () => props.annotation,
  annotation => {
    if (!mapSwitchController || !isShowNameLabel.value) return
    mapSwitchController.setAnnotation(annotation ?? null)
  },
  { deep: true }
)

watch(isShowTerrain, enabled => {
  if (!mapSwitchController) return
  mapSwitchController.setTerrain(enabled ? (props.terrain ?? null) : null)
})

watch(
  () => props.terrain,
  terrain => {
    if (!mapSwitchController || !isShowTerrain.value) return
    mapSwitchController.setTerrain(terrain ?? null)
  },
  { deep: true }
)

watch(
  () => props.token,
  token => {
    if (!mapSwitchController) return
    mapSwitchController.setToken(token)
  }
)

const handleMapChange = (event: MapSwitchChangeEvent) => {
  currentIndex.value = event.currentIndex
}

useSceneGetter({
  loaded: (sceneViewer: any) => {
    destroyMapSwitchController()
    mapSwitchController = new MapSwitch(sceneViewer, {
      baseMapLayers: baseMapLayersValue.value ?? [],
      terrain: isShowTerrain.value ? (props.terrain ?? null) : null,
      annotation: isShowNameLabel.value ? (props.annotation ?? null) : null,
      token: props.token,
      defaultIndex: props.defaultIndex
    })
    hasOriginalBaseLayer.value = mapSwitchController.hasOriginalBaseLayer
    currentIndex.value = mapSwitchController.currentIndex
    mapSwitchController.on({ change: handleMapChange })

    if (props.defaultIndex !== undefined && props.defaultIndex !== currentIndex.value) {
      switchTo(props.defaultIndex)
    }
  },
  removed: () => {
    destroyMapSwitchController()
    hasOriginalBaseLayer.value = false
    currentIndex.value = undefined
  }
})

onBeforeUnmount(() => {
  destroyMapSwitchController()
})

const switchTo = (index: number) => {
  if (!mapSwitchController) {
    return
  }
  mapSwitchController.switchTo(index)
}

function destroyMapSwitchController() {
  if (!mapSwitchController) {
    return
  }
  mapSwitchController.un({ change: handleMapChange })
  mapSwitchController.clear()
  mapSwitchController = null
}
</script>
