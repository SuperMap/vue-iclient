<template>
  <SmCollapseCard
    ref="rootRef"
    icon-class="sm-components-icon-layer-list"
    :icon-position="position"
    :header-name="t('sceneOpennessAnalysis.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :text-color="textColor"
    :split-line="splitLine"
    class="sm-component-scene-openness-analysis"
  >
    <SmCard :bordered="false" :style="textColorHeadingStyle">
      <div class="sm-component-scene-openness-analysis__grid">
        <label>X</label>
        <SmInputNumber
          v-model:value="state.positionX"
          :controls="false"
          @change="handlePositionChange"
        />
        <label>Y</label>
        <SmInputNumber
          v-model:value="state.positionY"
          :controls="false"
          @change="handlePositionChange"
        />
        <label>Z</label>
        <SmInputNumber
          v-model:value="state.positionZ"
          :controls="false"
          @change="handlePositionChange"
        />
      </div>
      <div
        v-for="item in sliders"
        :key="item.key"
        class="sm-component-scene-openness-analysis__item"
      >
        <label :title="t(item.label)">{{ t(item.label) }}</label>
        <SmSlider v-model:value="state[item.key]" :min="item.min" :max="item.max" :step="1" />
      </div>
      <div class="sm-component-scene-openness-analysis__item">
        <label :title="t('sceneOpennessAnalysis.visibleAreaColor')">
          {{ t('sceneOpennessAnalysis.visibleAreaColor') }}
        </label>
        <SmColorPicker v-model="state.visibleAreaColor" />
      </div>
      <div class="sm-component-scene-openness-analysis__item">
        <label :title="t('sceneOpennessAnalysis.hiddenAreaColor')">
          {{ t('sceneOpennessAnalysis.hiddenAreaColor') }}
        </label>
        <SmColorPicker v-model="state.hiddenAreaColor" />
      </div>
      <div class="sm-component-scene-openness-analysis__item">
        <label :title="t('sceneOpennessAnalysis.displayMode')">
          {{ t('sceneOpennessAnalysis.displayMode') }}
        </label>
        <SmSelect v-model:value="state.displayMode">
          <SmSelectOption :value="0">{{ t('sceneOpennessAnalysis.visiblePart') }}</SmSelectOption>
          <SmSelectOption :value="1">{{ t('sceneOpennessAnalysis.hiddenPart') }}</SmSelectOption>
          <SmSelectOption :value="2">{{ t('sceneOpennessAnalysis.showAll') }}</SmSelectOption>
        </SmSelect>
      </div>
      <SmCheckbox v-model:checked="state.isClosed">
        {{ t('sceneOpennessAnalysis.isClosed') }}
      </SmCheckbox>
      <div class="sm-component-scene-openness-analysis__buttons">
        <SmButton type="primary" @click="handleAnalysis">
          {{ t('sceneOpennessAnalysis.analysis') }}
        </SmButton>
        <SmButton @click="handleClear">{{ t('sceneOpennessAnalysis.clear') }}</SmButton>
      </div>
    </SmCard>
  </SmCollapseCard>
</template>
<script setup lang="ts">
import { onBeforeUnmount, reactive, watch, useTemplateRef } from 'vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { OpennessAnalysis } from 'vue-iclient-core/utils/scene/openness-analysis'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSlider from '@supermapgis/common/components/slider/Slider'
import SmButton from '@supermapgis/common/components/button/Button'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmInputNumber from '@supermapgis/common/components/input-number/InputNumber'
import SmColorPicker from '@supermapgis/common/components/color-picker/color-picker.vue'
import type { SceneOpennessAnalysisProps } from './types'
import { sceneOpennessAnalysisPropsDefault } from './types'

defineOptions({ name: 'SmSceneOpennessAnalysis' })
const props = withDefaults(
  defineProps<SceneOpennessAnalysisProps>(),
  sceneOpennessAnalysisPropsDefault
)
const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)
const rootEl = useTemplateRef('rootRef')
useSceneControl(() => rootEl.value?.$el)
const state = reactive({
  positionX: undefined as number | undefined,
  positionY: undefined as number | undefined,
  positionZ: undefined as number | undefined,
  distance: props.options?.distance ?? 100,
  startAngle: props.options?.startAngle ?? 0,
  endAngle: props.options?.endAngle ?? 360,
  visibleAreaColor: props.options?.visibleAreaColor ?? '#00B7EF',
  hiddenAreaColor: props.options?.hiddenAreaColor ?? '#E36C09',
  displayMode: props.options?.displayMode ?? 2,
  isClosed: props.options?.isClosed ?? false
})
const sliders = [
  { key: 'distance' as const, label: 'sceneOpennessAnalysis.analysisRadius', min: 1, max: 1000 },
  { key: 'startAngle' as const, label: 'sceneOpennessAnalysis.startAngle', min: 0, max: 360 },
  { key: 'endAngle' as const, label: 'sceneOpennessAnalysis.endAngle', min: 0, max: 360 }
]
let analysis: OpennessAnalysis | null = null
useSceneGetter({
  loaded(viewer) {
    destroy()
    analysis = new OpennessAnalysis(viewer, {
      ...props.options,
      ...state,
      onPositionChange: syncPosition
    })
  },
  removed: destroy
})
function syncPosition(position?: [number, number, number]) {
  state.positionX = position?.[0]
  state.positionY = position?.[1]
  state.positionZ = position?.[2]
}
function handlePositionChange() {
  if ([state.positionX, state.positionY, state.positionZ].every(value => typeof value === 'number'))
    analysis?.setViewPosition([state.positionX!, state.positionY!, state.positionZ!])
}
function handleAnalysis() {
  analysis?.execute()
}
function handleClear() {
  analysis?.clear()
}
function destroy() {
  analysis?.destroy()
  analysis = null
  syncPosition()
}
watch(
  () => state.distance,
  value => analysis?.setDistance(value)
)
watch(
  () => state.startAngle,
  value => analysis?.setStartAngle(value)
)
watch(
  () => state.endAngle,
  value => analysis?.setEndAngle(value)
)
watch(
  () => state.visibleAreaColor,
  value => analysis?.setVisibleAreaColor(value)
)
watch(
  () => state.hiddenAreaColor,
  value => analysis?.setHiddenAreaColor(value)
)
watch(
  () => state.displayMode,
  value => analysis?.setDisplayMode(value)
)
watch(
  () => state.isClosed,
  value => analysis?.setClosed(value)
)
watch(
  () => props.options,
  value => {
    if (value?.distance !== undefined) state.distance = value.distance
    if (value?.startAngle !== undefined) state.startAngle = value.startAngle
    if (value?.endAngle !== undefined) state.endAngle = value.endAngle
    if (value?.visibleAreaColor !== undefined) state.visibleAreaColor = value.visibleAreaColor
    if (value?.hiddenAreaColor !== undefined) state.hiddenAreaColor = value.hiddenAreaColor
    if (value?.displayMode !== undefined) state.displayMode = value.displayMode
    if (value?.isClosed !== undefined) state.isClosed = value.isClosed
  },
  { deep: true }
)
onBeforeUnmount(destroy)
</script>
