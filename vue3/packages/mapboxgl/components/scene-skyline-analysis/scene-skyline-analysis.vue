<template>
  <SmCollapseCard
    icon-class="sm-components-icon-chart"
    :icon-position="position"
    :header-name="t('sceneSkylineAnalysis.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-scene-skyline-analysis"
    ref="skylineRef"
  >
    <SmCard
      class="sm-component-scene-skyline-analysis__panel"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-skyline-analysis__content">
        <div class="sm-component-scene-skyline-analysis__item">
          <label>{{ t('sceneSkylineAnalysis.displayMode') }}</label>
          <SmSelect
            v-model:value="state.skylineMode"
            class="sm-component-scene-skyline-analysis__control"
          >
            <SmSelectOption value="LINE">
              {{ t('sceneSkylineAnalysis.lineDisplay') }}
            </SmSelectOption>
            <SmSelectOption value="FACE">
              {{ t('sceneSkylineAnalysis.faceDisplay') }}
            </SmSelectOption>
            <SmSelectOption value="BODY">
              {{ t('sceneSkylineAnalysis.bodyDisplay') }}
            </SmSelectOption>
          </SmSelect>
        </div>

        <div class="sm-component-scene-skyline-analysis__item">
          <label>{{ t('sceneSkylineAnalysis.analysisRadius') }}</label>
          <SmInputNumber
            v-model:value="state.skylineRadius"
            :min="1"
            :max="100000"
            class="sm-component-scene-skyline-analysis__control"
            :addon-after="t('sceneSkylineAnalysis.meter')"
          />
        </div>

        <div class="sm-component-scene-skyline-analysis__item">
          <label>{{ t('sceneSkylineAnalysis.lineWidth') }}</label>
          <SmSlider v-model:value="state.lineWidth" :min="1" :max="10" :step="1" />
        </div>

        <div class="sm-component-scene-skyline-analysis__item">
          <label>{{ t('sceneSkylineAnalysis.skylineColor') }}</label>
          <SmColorPicker
            v-model="state.skylineColor"
            class="sm-component-scene-skyline-analysis__color-picker"
          />
        </div>

        <div
          v-show="state.skylineMode === 'BODY'"
          class="sm-component-scene-skyline-analysis__item"
        >
          <label>{{ t('sceneSkylineAnalysis.skylineBodyColor') }}</label>
          <div class="sm-component-scene-skyline-analysis__checkbox-row">
            <SmCheckbox v-model:checked="state.displaySkyBody" />
            <SmColorPicker
              v-model="state.skyBodyColor"
              :disabled="!state.displaySkyBody"
              class="sm-component-scene-skyline-analysis__color-picker"
            />
          </div>
        </div>

        <div class="sm-component-scene-skyline-analysis__item">
          <label>{{ t('sceneSkylineAnalysis.highlightObstacles') }}</label>
          <div class="sm-component-scene-skyline-analysis__checkbox-row">
            <SmCheckbox v-model:checked="state.highlightBarrier" />
            <SmColorPicker
              v-model="state.barrierColor"
              :disabled="!state.highlightBarrier"
              class="sm-component-scene-skyline-analysis__color-picker"
            />
          </div>
        </div>

        <div class="sm-component-scene-skyline-analysis__item">
          <SmCheckbox v-model:checked="state.getSkyline2d">
            {{ t('sceneSkylineAnalysis.display2D') }}
          </SmCheckbox>
        </div>

        <div class="sm-component-scene-skyline-analysis__item">
          <SmCheckbox v-model:checked="state.ignoreGlobe">
            {{ t('sceneSkylineAnalysis.globeNoAnalysis') }}
          </SmCheckbox>
        </div>

        <div class="sm-component-scene-skyline-analysis__buttons">
          <SmButton type="primary" @click="handleAnalysis">
            {{ t('sceneSkylineAnalysis.analysis') }}
          </SmButton>
          <SmButton @click="handleDrawViewPoint">
            {{ t('sceneSkylineAnalysis.drawViewPoint') }}
          </SmButton>
          <SmButton @click="handleLimitBody">
            {{ t('sceneSkylineAnalysis.limitBody') }}
          </SmButton>
          <SmButton @click="handleClear">
            {{ t('sceneSkylineAnalysis.clear') }}
          </SmButton>
        </div>

        <div
          v-show="state.getSkyline2d && showChart"
          :id="chartContainerId"
          class="sm-component-scene-skyline-analysis__chart"
        />
      </div>
    </SmCard>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import type { SceneSkylineAnalysisProps } from './types'
import { reactive, ref, watch, onBeforeUnmount, useTemplateRef } from 'vue'
import UniqueId from 'lodash.uniqueid'
import * as echarts from 'echarts'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneSkylineAnalysisPropsDefault } from './types'
import { SkylineAnalysis } from 'vue-iclient-core/utils/scene/skyline-analysis'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmButton from '@supermapgis/common/components/button/Button'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'
import SmSlider from '@supermapgis/common/components/slider/Slider'
import SmInputNumber from '@supermapgis/common/components/input-number/InputNumber'
import SmColorPicker from '@supermapgis/common/components/color-picker/color-picker.vue'

defineOptions({
  name: 'SmSceneSkylineAnalysis'
})

const props = withDefaults(
  defineProps<SceneSkylineAnalysisProps>(),
  sceneSkylineAnalysisPropsDefault
)

const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const rootEl = useTemplateRef('skylineRef')
useSceneControl(() => rootEl.value?.$el)

const chartContainerId = UniqueId('sm-skyline-chart-')
const showChart = ref(false)
let skylineAnalysis: SkylineAnalysis | null = null
let viewer: any = null

interface SkylineState {
  skylineRadius: number
  lineWidth: number
  skylineColor: string
  displaySkyBody: boolean
  skyBodyColor: string
  highlightBarrier: boolean
  barrierColor: string
  skylineMode: 'LINE' | 'FACE' | 'BODY'
  getSkyline2d: boolean
  ignoreGlobe: boolean
  clearFlag: boolean
}

const state = reactive<SkylineState>({
  skylineRadius: props.options?.radius ?? 10000,
  lineWidth: props.options?.lineWidth ?? 2,
  skylineColor: props.options?.color ?? 'rgb(200, 0, 0)',
  displaySkyBody: false,
  skyBodyColor: 'rgba(44,149,197,0.6)',
  highlightBarrier: props.options?.highlightBarrier ?? false,
  barrierColor: 'rgba(255, 186, 1, 1)',
  skylineMode: 'LINE',
  getSkyline2d: false,
  ignoreGlobe: props.options?.ignoreGlobe ?? true,
  clearFlag: true
})

useSceneGetter({
  loaded: (sceneViewer: any) => {
    destroySkylineAnalysis()
    viewer = sceneViewer
    skylineAnalysis = new SkylineAnalysis(viewer, {
      ...props.options,
      radius: state.skylineRadius,
      lineWidth: state.lineWidth,
      color: state.skylineColor,
      ignoreGlobe: state.ignoreGlobe,
      highlightBarrier: state.highlightBarrier
    })
  },
  removed: () => {
    destroySkylineAnalysis()
    viewer = null
  }
})

onBeforeUnmount(() => {
  destroySkylineAnalysis()
})

function destroySkylineAnalysis() {
  handleClear()
  if (skylineAnalysis) {
    skylineAnalysis.destroy()
    skylineAnalysis = null
  }
}

function handleAnalysis() {
  if (!skylineAnalysis) return
  state.clearFlag = false
  skylineAnalysis.execute()

  if (state.getSkyline2d) {
    showChart.value = true
    setTimeout(() => {
      skylineAnalysis?.showSkyline2DChart(echarts, `#${chartContainerId}`)
    }, 500)
  }

  if (state.skylineMode === 'FACE') {
    updatePosition()
  }
}

function updatePosition() {
  if (!viewer) return
  const position = viewer.camera.position
  const cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(position).height
  const moveRate = cameraHeight / 200.0
  viewer.camera.moveBackward(moveRate)
}

function handleClear() {
  skylineAnalysis?.clear()
  state.getSkyline2d = false
  state.clearFlag = true
  showChart.value = false
}

function handleLimitBody() {
  skylineAnalysis?.drawLimitBody()
}

async function handleDrawViewPoint() {
  await skylineAnalysis?.drawViewPoint()
}

watch(
  () => state.skylineRadius,
  val => {
    if (skylineAnalysis?.skyline) {
      skylineAnalysis.skyline.radius = val
    }
  }
)

watch(
  () => state.lineWidth,
  val => {
    if (!state.clearFlag && skylineAnalysis?.skyline) {
      handleClear()
      handleAnalysis()
      skylineAnalysis.skyline.lineWidth = Number(val)
    }
  }
)

watch(
  () => state.skylineColor,
  newValue => {
    if (skylineAnalysis?.skyline && window.SuperMap3D) {
      const color = window.SuperMap3D.Color.fromCssColorString(newValue)
      if (color.alpha > 0.1) {
        skylineAnalysis.skyline.color = color
      }
    }
  }
)

watch(
  () => state.skyBodyColor,
  newValue => {
    if (skylineAnalysis && window.SuperMap3D) {
      const color = window.SuperMap3D.Color.fromCssColorString(newValue)
      if (color.alpha > 0.1) {
        skylineAnalysis.setSkylineBodyColor(color)
      }
    }
  }
)

watch(
  () => state.barrierColor,
  newValue => {
    if (skylineAnalysis && window.SuperMap3D) {
      const barrierColor = window.SuperMap3D.Color.fromCssColorString(newValue)
      if (barrierColor.alpha > 0.1) {
        skylineAnalysis.setBarrierColor(barrierColor)
      }
    }
  }
)

watch(
  () => state.ignoreGlobe,
  () => {
    if (skylineAnalysis?.skyline) {
      skylineAnalysis.skyline.ignoreGlobe = state.ignoreGlobe
      if (!state.clearFlag) {
        handleClear()
        handleAnalysis()
      }
    }
  }
)

watch(
  () => state.highlightBarrier,
  newValue => {
    if (!skylineAnalysis || !window.SuperMap3D) return
    skylineAnalysis.highlightBarrier = newValue
    if (!skylineAnalysis.skyline) return
    try {
      if (newValue) {
        const barrierColor = window.SuperMap3D.Color.fromCssColorString(state.barrierColor)
        skylineAnalysis.setBarrierColor(barrierColor)
      } else {
        skylineAnalysis.clearBarrierColor()
      }
    } catch (error) {
      console.warn('Failed to update barrier highlight:', error)
    }
  }
)

watch(
  () => state.getSkyline2d,
  newValue => {
    if (newValue) {
      showChart.value = true
      setTimeout(() => {
        if (!state.clearFlag) {
          skylineAnalysis?.showSkyline2DChart(echarts, `#${chartContainerId}`)
        }
      }, 500)
    } else {
      showChart.value = false
    }
  }
)

watch(
  () => state.skylineMode,
  newValue => {
    if (skylineAnalysis) {
      skylineAnalysis.setSkylineMode(newValue)
      if (newValue === 'FACE') {
        updatePosition()
      }
    }
  }
)

watch(
  () => props.options,
  options => {
    skylineAnalysis?.updateOptions(options)
  },
  { deep: true }
)
</script>
