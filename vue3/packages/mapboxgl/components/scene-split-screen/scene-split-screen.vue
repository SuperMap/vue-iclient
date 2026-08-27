<template>
  <SmCollapseCard
    icon-class="sm-components-icon-shujufenping"
    :icon-position="position"
    :header-name="t('sceneSplitScreen.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-scene-split-screen"
    ref="splitScreenRef"
  >
    <SmCard
      class="sm-component-scene-split-screen__panel"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-split-screen__content">
        <div class="sm-component-scene-split-screen__item">
          <label>{{ t('sceneSplitScreen.modeLabel') }}</label>
          <SmSelect
            v-model:value="selectedMode"
            class="sm-component-scene-split-screen__control"
            @change="handleModeChange"
          >
            <SmSelectOption
              v-for="mode in splitModes"
              :key="mode.value"
              :value="mode.value"
            >
              {{ mode.label }}
            </SmSelectOption>
          </SmSelect>
        </div>

        <template v-if="selectedMode !== 'NONE'">
          <SceneLayerMultiSelectList
            v-if="layersInfo.length"
            :title="t('sceneSplitScreen.layerVisibilityLabel')"
            :items="layersInfo"
            :options="viewportOptions"
            @change="handleLayerViewportChange"
          />
          <div v-else class="sm-component-scene-split-screen__item">
            <span class="sm-component-scene-split-screen__loading">
              {{ t('sceneSplitScreen.loading') }}
            </span>
          </div>
        </template>
      </div>
    </SmCard>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import type { SceneSplitScreenProps } from './types'
import { computed, reactive, ref, onBeforeUnmount, useTemplateRef } from 'vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneSplitScreenPropsDefault } from './types'
import { SplitScreen } from 'vue-iclient-core/utils/scene/split-screen'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SceneLayerMultiSelectList from '@supermapgis/mapboxgl/components/scene-layer-list/scene-layer-multi-select-list.vue'
import type {
  SceneLayerMultiSelectItem,
  SceneLayerMultiSelectOption,
  SceneLayerMultiSelectValue
} from '@supermapgis/mapboxgl/components/scene-layer-list/scene-layer-multi-select-list.types'

defineOptions({
  name: 'SmSceneSplitScreen'
})

interface LayerInfo extends SceneLayerMultiSelectItem {
  layer: any
}

const props = withDefaults(defineProps<SceneSplitScreenProps>(), sceneSplitScreenPropsDefault)

const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const rootEl = useTemplateRef('splitScreenRef')
useSceneControl(() => rootEl.value?.$el)

const layersInfo = reactive<LayerInfo[]>([])
const selectedMode = ref('NONE')
let splitScreen: SplitScreen | null = null
let viewer: any = null

const splitModes = computed(() => [
  { label: t('sceneSplitScreen.modeNone'), value: 'NONE' },
  { label: t('sceneSplitScreen.modeHorizontal'), value: 'HORIZONTAL' },
  { label: t('sceneSplitScreen.modeVertical'), value: 'VERTICAL' },
  { label: t('sceneSplitScreen.modeQuad'), value: 'QUAD' },
  { label: t('sceneSplitScreen.modeTriple'), value: 'TRIPLE' },
  { label: t('sceneSplitScreen.modeVerticalTrisection'), value: 'VerticalTrisection' }
])

const viewportOptions = computed<SceneLayerMultiSelectOption[]>(() => {
  const count = splitScreen?.getViewModeCount(selectedMode.value) ?? 1
  const viewportLabels = [
    t('sceneSplitScreen.viewport1'),
    t('sceneSplitScreen.viewport2'),
    t('sceneSplitScreen.viewport3'),
    t('sceneSplitScreen.viewport4')
  ]
  return Array.from({ length: count }, (_, i) => ({ label: viewportLabels[i], value: i }))
})

function refreshLayersInfo() {
  if (!viewer || !splitScreen) return
  const queue = viewer.scene?.layers?.layerQueue || viewer.scene?.layers?._layerQueue || []
  const defaultIndices = splitScreen.getViewportIndices()
  const nextLayers: LayerInfo[] = []

  queue
    .filter((layer: any) => typeof layer.setVisibleInViewport === 'function')
    .forEach((layer: any, index: number) => {
      const id = getLayerId(layer, index)
      splitScreen!.setLayerVisibility(layer, defaultIndices, true)
      nextLayers.push({
        id,
        name: layer.name,
        layer,
        selectedValues: [...defaultIndices]
      })
    })

  layersInfo.splice(0, layersInfo.length, ...nextLayers)
}

function destroySplitScreen() {
  if (splitScreen) {
    splitScreen.destroy()
    splitScreen = null
  }
  layersInfo.splice(0, layersInfo.length)
  viewer = null
  selectedMode.value = 'NONE'
}

useSceneGetter({
  loaded: (sceneViewer: any) => {
    destroySplitScreen()
    viewer = sceneViewer
    splitScreen = new SplitScreen(viewer)
  },
  removed: () => {
    destroySplitScreen()
  }
})

function handleModeChange(mode: string) {
  if (!splitScreen || !viewer) return
  splitScreen.setSplitMode(mode)
  if (mode === 'NONE') {
    layersInfo.splice(0, layersInfo.length)
    return
  }
  refreshLayersInfo()
}

function handleLayerViewportChange(id: string, values: SceneLayerMultiSelectValue[]) {
  const layerInfo = layersInfo.find(item => item.id === id)
  if (!layerInfo || !splitScreen) return
  const selectedViewports = values.filter(
    (value): value is number => typeof value === 'number'
  )
  layerInfo.selectedValues = selectedViewports
  const defaultIndices = splitScreen.getViewportIndices()
  splitScreen.setLayerVisibility(layerInfo.layer, defaultIndices, false)
  splitScreen.setLayerVisibility(layerInfo.layer, selectedViewports, true)
}

function getLayerId(layer: any, index: number) {
  return String(layer?.id ?? layer?.name ?? index) + '-' + index
}

onBeforeUnmount(() => {
  destroySplitScreen()
})
</script>
