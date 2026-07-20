<template>
  <SmCollapseCard
    icon-class="sm-components-icon-chart"
    :icon-position="position"
    :header-name="t('sceneSunlightAnalysis.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-scene-sunlight-analysis"
    ref="sunlightRef"
  >
    <SmCard
      class="sm-component-scene-sunlight-analysis__panel"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-sunlight-analysis__content">
        <div class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.date') }}</label>
          <SmDatePicker
            v-model:value="state.currentDate"
            format="YYYY-MM-DD"
            :allow-clear="false"
            class="sm-component-scene-sunlight-analysis__control"
          />
        </div>

        <div class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.startTime') }}</label>
          <SmSelect v-model:value="state.startTime" class="sm-component-scene-sunlight-analysis__control">
            <SmSelectOption v-for="time in startTimeOptions" :key="time" :value="time">
              {{ time }}
            </SmSelectOption>
          </SmSelect>
        </div>

        <div class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.endTime') }}</label>
          <SmSelect v-model:value="state.endTime" class="sm-component-scene-sunlight-analysis__control">
            <SmSelectOption v-for="time in endTimeOptions" :key="time" :value="time">
              {{ time }}
            </SmSelectOption>
          </SmSelect>
        </div>

        <div class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.displayMode') }}</label>
          <SmRadioGroup v-model:value="state.displayMode">
            <SmRadio :value="0">{{ t('sceneSunlightAnalysis.sunshine') }}</SmRadio>
            <SmRadio :value="1">{{ t('sceneSunlightAnalysis.shadow') }}</SmRadio>
          </SmRadioGroup>
        </div>

        <div v-if="state.displayMode === 0" class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.sunshineColor') }}</label>
          <ColorTableSelect
            v-model:value="state.sunshineColor"
            :gradient-list="gradientList"
            :placeholder="t('sceneSunlightAnalysis.selectColorTable')"
            @change="handleSunshineColorChange"
          />
        </div>

        <div v-else class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.shadowColor') }}</label>
          <SmColorPicker
            v-model="state.shadowColor"
            class="sm-component-scene-sunlight-analysis__color-picker"
          />
        </div>

        <div class="sm-component-scene-sunlight-analysis__item">
          <label>{{ t('sceneSunlightAnalysis.maxDistance') }}</label>
          <div class="sm-component-scene-sunlight-analysis__slider-row">
            <SmSlider v-model:value="state.maxDistance" :min="10" :max="3000" :step="10" />
            <span class="sm-component-scene-sunlight-analysis__slider-value">
              {{ state.maxDistance }}{{ t('sceneSunlightAnalysis.meter') }}
            </span>
          </div>
        </div>

        <div class="sm-component-scene-sunlight-analysis__buttons">
          <SmButton type="primary" @click="handleSimulate">
            {{ t('sceneSunlightAnalysis.analysis') }}
          </SmButton>
          <SmButton @click="handleClear">
            {{ t('sceneSunlightAnalysis.clear') }}
          </SmButton>
        </div>
      </div>
    </SmCard>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import type { SceneSunlightAnalysisProps, GradientItem } from './types'
import type { Dayjs } from 'dayjs'
import { reactive, computed, watch, onBeforeUnmount, useTemplateRef } from 'vue'
import dayjs from 'dayjs'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneSunlightAnalysisPropsDefault } from './types'
import { SunlightAnalysis } from 'vue-iclient-core/utils/scene/sunlight-analysis'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmButton from '@supermapgis/common/components/button/Button'
import SmSlider from '@supermapgis/common/components/slider/Slider'
import SmColorPicker from '@supermapgis/common/components/color-picker/color-picker.vue'
import SmDatePicker from '@supermapgis/common/components/date-picker/DatePicker'
import SmRadio, { SmRadioGroup } from '@supermapgis/common/components/radio/Radio'
import ColorTableSelect from './color-table-select.vue'

defineOptions({
  name: 'SmSceneSunlightAnalysis'
})

interface SunshineState {
  currentDate: Dayjs
  startTime: string
  endTime: string
  displayMode: 0 | 1
  sunshineColor: string
  shadowColor: string
  maxDistance: number
}

const props = withDefaults(defineProps<SceneSunlightAnalysisProps>(), sceneSunlightAnalysisPropsDefault)

const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const rootEl = useTemplateRef('sunlightRef')
useSceneControl(() => rootEl.value?.$el)

let viewer: any = null
let sunlightAnalysis: SunlightAnalysis | null = null

const state = reactive<SunshineState>({
  currentDate: dayjs(),
  startTime: '00:00',
  endTime: '22:00',
  displayMode: 0,
  sunshineColor: props.gradientList?.[0]?.key ?? 'rainbow',
  shadowColor: 'rgba(128, 128, 128, 1)',
  maxDistance: props.options?.maxDistance ?? 1500
})

const startTimeOptions = computed(() => {
  const times: string[] = []
  for (let hour = 0; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return times
})

const endTimeOptions = computed(() => {
  const times: string[] = []
  for (let hour = 2; hour <= 24; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)
  }
  return times
})

const gradientList = computed<GradientItem[]>(() => {
  return (props.gradientList || []).map((item) => {
    const i18nKey = `sceneSunlightAnalysis.${item.key}`
    const i18nLabel = t(i18nKey)
    return {
      ...item,
      label: i18nLabel !== i18nKey ? i18nLabel : item.label
    }
  })
})

function parseRGBAColor(colorStr: string) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/)
  const colorObj: { red: number; green: number; blue: number; alpha?: number } = {
    red: 0,
    green: 0,
    blue: 0
  }
  if (match) {
    colorObj.red = parseInt(match[1], 10)
    colorObj.green = parseInt(match[2], 10)
    colorObj.blue = parseInt(match[3], 10)
    if (match[4]) {
      colorObj.alpha = parseFloat(match[4])
    }
  }
  return colorObj
}

function getStops(sunshineColor = state.sunshineColor) {
  return gradientList.value.find((item) => item.key === sunshineColor)?.stops || []
}

function getSunshineColor() {
  return getStops().map(([color, value]) => ({
    color: parseRGBAColor(color),
    value
  }))
}

function destroySunlightAnalysis() {
  sunlightAnalysis?.destroy()
  sunlightAnalysis = null
}

function createSunlightAnalysis() {
  if (!viewer) return
  sunlightAnalysis = new SunlightAnalysis(viewer, {
    ...props.options,
    displayMode: state.displayMode,
    date: state.currentDate.format('YYYY-MM-DD'),
    startTime: parseInt(state.startTime.split(':')[0], 10),
    endTime: parseInt(state.endTime.split(':')[0], 10),
    maxDistance: state.maxDistance,
    visualizationColor: state.shadowColor,
    sunshineColor: getSunshineColor()
  })
}

useSceneGetter({
  loaded: (sceneViewer: any) => {
    destroySunlightAnalysis()
    viewer = sceneViewer
    createSunlightAnalysis()
  },
  removed: () => {
    destroySunlightAnalysis()
    viewer = null
  }
})

watch(
  () => state.displayMode,
  () => {
    sunlightAnalysis?.setDisplayMode(state.displayMode)
  }
)

function handleSunshineColorChange() {
  sunlightAnalysis?.setSunshineColor(getSunshineColor())
}

function handleSimulate() {
  sunlightAnalysis?.execute()
}

function handleClear() {
  sunlightAnalysis?.clear()
}

watch(
  () => state.currentDate,
  () => {
    sunlightAnalysis?.setDate(state.currentDate.format('YYYY-MM-DD'))
  }
)

watch(
  () => state.startTime,
  () => {
    sunlightAnalysis?.setStartTime(parseInt(state.startTime.split(':')[0], 10))
  }
)

watch(
  () => state.endTime,
  () => {
    sunlightAnalysis?.setEndTime(parseInt(state.endTime.split(':')[0], 10))
  }
)

watch(
  () => state.maxDistance,
  () => {
    sunlightAnalysis?.setMaxDistance(state.maxDistance)
  }
)

watch(
  () => state.shadowColor,
  () => {
    sunlightAnalysis?.setVisualizationColor(state.shadowColor)
  }
)

onBeforeUnmount(() => {
  destroySunlightAnalysis()
})
</script>
