<template>
  <SmCollapseCard
    ref="rootRef"
    icon-class="sm-components-icon-tongshifenxi"
    :icon-position="position"
    :header-name="t('sceneSightlineAnalysis.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :text-color="textColor"
    :split-line="splitLine"
    class="sm-component-scene-sightline-analysis"
  >
    <SmCard :bordered="false" :style="textColorHeadingStyle">
      <div class="sm-component-scene-sightline-analysis__modes">
        <SmButton
          v-for="item in modes"
          :key="item.value"
          :type="mode === item.value ? 'primary' : 'default'"
          @click="changeMode(item.value)"
        >
          {{ t(item.label) }}
        </SmButton>
      </div>
      <template v-if="mode === 'ViewShed'">
        <div
          v-for="item in viewShedControls"
          :key="item.key"
          class="sm-component-scene-sightline-analysis__item"
        >
          <label :title="t(item.label)">{{ t(item.label) }}</label>
          <SmSlider
            v-if="item.slider"
            v-model:value="viewShedState[item.key]"
            :min="item.min"
            :max="item.max"
          />
          <SmInputNumber
            v-else
            v-model:value="viewShedState[item.key]"
            :min="item.min"
            :max="item.max"
          />
        </div>
      </template>
      <template v-else>
        <div class="sm-component-scene-sightline-analysis__item">
          <label :title="t('sceneSightlineAnalysis.lineWidth')">
            {{ t('sceneSightlineAnalysis.lineWidth') }}
          </label>
          <SmSlider v-model:value="lineState.lineWidth" :min="1" :max="5" :step="0.5" />
        </div>
        <div class="sm-component-scene-sightline-analysis__item">
          <label :title="t('sceneSightlineAnalysis.offsetHeight')">
            {{ t('sceneSightlineAnalysis.offsetHeight') }}
          </label>
          <SmInputNumber v-model:value="lineState.offsetHeight" :min="0" :max="500" />
        </div>
      </template>
      <div class="sm-component-scene-sightline-analysis__item">
        <label :title="t('sceneSightlineAnalysis.visibleAreaColor')">
          {{ t('sceneSightlineAnalysis.visibleAreaColor') }}
        </label>
        <SmColorPicker v-model="colors.visible" />
      </div>
      <div class="sm-component-scene-sightline-analysis__item">
        <label :title="t('sceneSightlineAnalysis.hiddenAreaColor')">
          {{ t('sceneSightlineAnalysis.hiddenAreaColor') }}
        </label>
        <SmColorPicker v-model="colors.hidden" />
      </div>
      <div class="sm-component-scene-sightline-analysis__buttons">
        <SmButton
          v-if="mode === 'Sightline'"
          type="primary"
          :disabled="hasViewPoint"
          @click="addViewPoint"
        >
          {{ t('sceneSightlineAnalysis.selectViewPoint') }}
        </SmButton>
        <SmButton
          v-if="mode === 'Sightline'"
          type="primary"
          :disabled="!hasViewPoint"
          @click="addTargetPoint"
        >
          {{ t('sceneSightlineAnalysis.selectTargetPoint') }}
        </SmButton>
        <SmButton v-if="mode !== 'Sightline'" type="primary" @click="executeCurrent">
          {{ t('sceneSightlineAnalysis.selectViewPoint') }}
        </SmButton>
        <SmButton @click="clearCurrent">{{ t('sceneSightlineAnalysis.clear') }}</SmButton>
      </div>
    </SmCard>
  </SmCollapseCard>
</template>
<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch, useTemplateRef } from 'vue'
import { message } from 'ant-design-vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import {
  SightlineAnalysis,
  SightNetworkAnalysis,
  ViewShedAnalysis
} from 'vue-iclient-core/utils/scene/sightline-analysis'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSlider from '@supermapgis/common/components/slider/Slider'
import SmButton from '@supermapgis/common/components/button/Button'
import SmInputNumber from '@supermapgis/common/components/input-number/InputNumber'
import SmColorPicker from '@supermapgis/common/components/color-picker/color-picker.vue'
import type { SceneSightlineAnalysisMode, SceneSightlineAnalysisProps } from './types'
import { sceneSightlineAnalysisPropsDefault } from './types'

defineOptions({ name: 'SmSceneSightlineAnalysis' })
const props = withDefaults(
  defineProps<SceneSightlineAnalysisProps>(),
  sceneSightlineAnalysisPropsDefault
)
const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)
const rootEl = useTemplateRef('rootRef')
useSceneControl(() => rootEl.value?.$el)
const mode = ref<SceneSightlineAnalysisMode>(props.defaultMode)
const modes = [
  { value: 'ViewShed' as const, label: 'sceneSightlineAnalysis.viewShed' },
  { value: 'Sightline' as const, label: 'sceneSightlineAnalysis.sightline' },
  { value: 'SightNetwork' as const, label: 'sceneSightlineAnalysis.sightNetwork' }
]
const viewShedState = reactive({
  direction: 0,
  pitch: 0,
  distance: 200,
  offsetHeight: 0,
  horizontalFov: 90,
  verticalFov: 60
})
const viewShedControls = [
  {
    key: 'direction' as const,
    label: 'sceneSightlineAnalysis.direction',
    min: 0,
    max: 360,
    slider: true
  },
  { key: 'pitch' as const, label: 'sceneSightlineAnalysis.pitch', min: -90, max: 90, slider: true },
  {
    key: 'distance' as const,
    label: 'sceneSightlineAnalysis.distance',
    min: 1,
    max: 2000,
    slider: false
  },
  {
    key: 'offsetHeight' as const,
    label: 'sceneSightlineAnalysis.offsetHeight',
    min: 0,
    max: 500,
    slider: false
  },
  {
    key: 'horizontalFov' as const,
    label: 'sceneSightlineAnalysis.horizontalFov',
    min: 1,
    max: 179,
    slider: true
  },
  {
    key: 'verticalFov' as const,
    label: 'sceneSightlineAnalysis.verticalFov',
    min: 1,
    max: 179,
    slider: true
  }
]
const lineState = reactive({
  lineWidth: props.options?.lineWidth ?? 2,
  offsetHeight: props.options?.offsetHeight ?? 0
})
const colors = reactive({
  visible: props.options?.visibleColor ?? 'rgba(0,255,0,1)',
  hidden: props.options?.hiddenColor ?? 'rgba(255,0,0,1)'
})
const hasViewPoint = ref(false)
let viewer: any = null
let analysis: SightlineAnalysis | SightNetworkAnalysis | ViewShedAnalysis | null = null
useSceneGetter({
  loaded(value) {
    viewer = value
    createAnalysis()
  },
  removed() {
    destroy()
    viewer = null
  }
})
function createAnalysis() {
  destroy()
  if (!viewer) return
  if (mode.value === 'ViewShed')
    analysis = new ViewShedAnalysis(viewer, {
      ...viewShedState,
      visibleAreaColor: colors.visible,
      hiddenAreaColor: colors.hidden,
      showViewPoint: false
    })
  else if (mode.value === 'SightNetwork')
    analysis = new SightNetworkAnalysis(viewer, {
      ...props.options,
      ...lineState,
      visibleColor: colors.visible,
      hiddenColor: colors.hidden
    })
  else
    analysis = new SightlineAnalysis(viewer, {
      ...props.options,
      ...lineState,
      visibleColor: colors.visible,
      hiddenColor: colors.hidden,
      onAddViewPoint: () => {
        hasViewPoint.value = true
      }
    })
}
function changeMode(value: SceneSightlineAnalysisMode) {
  if (mode.value !== value) {
    mode.value = value
    createAnalysis()
  }
}
async function executeCurrent() {
  if (analysis instanceof ViewShedAnalysis) await analysis.activate(true)
  else if (analysis instanceof SightNetworkAnalysis)
    await analysis.drawCircleAnalysis(lineState.offsetHeight)
}
async function addViewPoint() {
  try {
    await (analysis as SightlineAnalysis)?.addViewPoint(lineState.offsetHeight)
  } catch {
    message.warning(t('sceneSightlineAnalysis.selectViewPoint'))
  }
}
async function addTargetPoint() {
  try {
    await (analysis as SightlineAnalysis)?.addTargetPoint()
  } catch {
    message.warning(t('sceneSightlineAnalysis.selectViewPoint'))
  }
}
function clearCurrent() {
  analysis?.clear()
  hasViewPoint.value = false
}
function destroy() {
  analysis?.destroy()
  analysis = null
  hasViewPoint.value = false
}
watch(lineState, value => {
  if (analysis instanceof SightlineAnalysis) {
    analysis.setLineWidth(value.lineWidth)
    analysis.setOffsetHeight(value.offsetHeight)
  }
})
watch(colors, value => {
  if (analysis instanceof SightlineAnalysis) {
    analysis.setVisibleColor(value.visible)
    analysis.setHiddenColor(value.hidden)
  } else if (analysis instanceof ViewShedAnalysis) {
    analysis.setVisibleAreaColor(value.visible)
    analysis.setHiddenAreaColor(value.hidden)
  }
})
watch(
  () => viewShedState.direction,
  value => {
    if (analysis instanceof ViewShedAnalysis) analysis.setDirection(value)
  }
)
watch(
  () => viewShedState.pitch,
  value => {
    if (analysis instanceof ViewShedAnalysis) analysis.setPitch(value)
  }
)
watch(
  () => viewShedState.distance,
  value => {
    if (analysis instanceof ViewShedAnalysis) analysis.setDistance(value)
  }
)
watch(
  () => viewShedState.offsetHeight,
  value => {
    if (analysis instanceof ViewShedAnalysis) analysis.setOffsetHeight(value)
  }
)
watch(
  () => viewShedState.horizontalFov,
  value => {
    if (analysis instanceof ViewShedAnalysis) analysis.setHorizontalFov(value)
  }
)
watch(
  () => viewShedState.verticalFov,
  value => {
    if (analysis instanceof ViewShedAnalysis) analysis.setVerticalFov(value)
  }
)
watch(() => props.options, createAnalysis, { deep: true })
onBeforeUnmount(destroy)
</script>
