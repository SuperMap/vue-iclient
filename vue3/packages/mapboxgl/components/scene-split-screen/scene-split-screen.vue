<template>
  <SmCollapseCard
    icon-class="sm-components-icon-layer-list"
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
          <div v-if="layersInfo.length" class="sm-component-scene-split-screen__item">
            <label>{{ t('sceneSplitScreen.layerVisibilityLabel') }}</label>
            <div class="sm-component-scene-split-screen__layer-list">
              <div
                v-for="layer in layersInfo"
                :key="layer.name"
                class="sm-component-scene-split-screen__layer-item"
              >
                <span class="sm-component-scene-split-screen__layer-name">{{ layer.name }}</span>
                <CheckboxGroup
                  v-model:value="layer.visibleInViewports"
                  class="sm-component-scene-split-screen__viewport-checkboxes"
                  :options="viewportOptions"
                  @change="(value: number[]) => toggleViewport(value, layer.name)"
                />
              </div>
            </div>
          </div>
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
import { Checkbox } from 'ant-design-vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneSplitScreenPropsDefault } from './types'
import { SplitScreen } from 'vue-iclient-core/utils/scene/split-screen'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'

defineOptions({
  name: 'SmSceneSplitScreen'
})

const CheckboxGroup = Checkbox.Group

interface LayerInfo {
  name: string
  visibleInViewports: number[]
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

const viewportOptions = computed(() => {
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
    .forEach((layer: any) => {
      splitScreen!.setLayerVisibility(layer, defaultIndices, true)
      nextLayers.push({
        name: layer.name,
        visibleInViewports: [...defaultIndices]
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

function toggleViewport(value: number[], name: string) {
  const layer = viewer?.scene?.layers?.find(name)
  if (!layer || !splitScreen) return
  const defaultIndices = splitScreen.getViewportIndices()
  splitScreen.setLayerVisibility(layer, defaultIndices, false)
  splitScreen.setLayerVisibility(layer, value, true)
}

onBeforeUnmount(() => {
  destroySplitScreen()
})
</script>
