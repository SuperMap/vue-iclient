<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName ?? t('measure.mapMeasure')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-measure"
  >
    <div class="sm-component-measure__panel" :style="textColorHeadingStyle">
      <div class="sm-component-measure__panelContent">
        <span
          v-for="group in modeGroups"
          v-show="group.mode !== 'delete' || (!continueDraw && group.mode === 'delete')"
          :key="group.mode"
          :title="group.title"
          :style="gisControlBgTertiaryStyle"
          :class="{
            'sm-component-measure__modeIcon': true,
            'is-active': activeMode === group.mode
          }"
          @click="changeMeasureMode(group.mode)"
        >
          <i :class="group.iconClass"></i>
        </span>
        <template v-if="showResultUnitsSelector">
          <sm-select
            v-model:value="unitSelected"
            :placeholder="t('measure.selectPlaceholder')"
            class="sm-component-measure__unit"
            :style="[textColorStyle, unitSelectorDropdownStyle]"
            :dropdownStyle="unitSelectorDropdownStyle"
            :get-popup-container="getPopupContainer"
            @change="updateUnit"
          >
            <sm-select-option
              v-for="(value, key) in unitSelectorOptions"
              :key="key"
              :title="value"
              :value="key"
            >
              {{ value }}
            </sm-select-option>
          </sm-select>
        </template>
        <div
          v-show="!showUnitSelect && activeMode"
          class="sm-component-measure__unit sm-component-measure__default"
        >
          {{ unitText }}
        </div>
      </div>
      <div v-show="unitResult" class="sm-component-measure__calculateResult">
        <div class="sm-component-measure__calcuTitle" :style="textColorHeadingStyle">
          {{ t('measure.measureResult') }}
        </div>
        <div class="sm-component-measure__result" :style="textColorStyle">{{ unitResult }}</div>
      </div>
    </div>
  </sm-collapse-card>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { MeasureProps, MeasureEvents } from './types'
import type { Units } from 'vue-iclient-core/controllers/mapboxgl/MeasureViewModel'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import { useMapGetter, useLocale } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import MeasureViewModel from 'vue-iclient-core/controllers/mapboxgl/MeasureViewModel'
import drawEvent from 'vue-iclient-core/controllers/mapboxgl/types/DrawEvent'
import { uniqueId } from 'lodash-es'
import { setPopupArrowStyle, removeColorOpacity } from 'vue-iclient-core/utils/util'
import 'vue-iclient-core/libs/mapbox-gl-draw/mapbox-gl-draw.css'
import { message as Message } from 'ant-design-vue'
import { measurePropsDefault } from './types'

const COMPONENT_NAME = 'SmMeasure'

defineOptions({
  name: COMPONENT_NAME,
  inheritAttrs: false
})

defineExpose({
  clear
})

const props = withDefaults(defineProps<MeasureProps>(), measurePropsDefault)
defineEmits<MeasureEvents>()

const componentName = uniqueId(COMPONENT_NAME)
const viewModel = new MeasureViewModel({
  continueDraw: props.continueDraw,
  componentName: componentName,
  geti18n: () => ({ t })
})
const { t } = useLocale()
const {
  textColorStyle,
  textColorHeadingStyle,
  popupBgStyle,
  gisControlHeaderBgStyle,
  gisControlBgTertiaryStyle
} = useTheme(props)
const { mapNotLoadedTip, getMap } = useMapGetter<Map>({
  removed,
  viewModel
})
const { isShow } = useMapControl()

// 单位选项
const unitOptions = {
  draw_line_string: {
    kilometers: t('unit.kilometers'),
    miles: t('unit.miles'),
    meters: t('unit.meters'),
    feet: t('unit.feet'),
    yards: t('unit.yards')
  },
  draw_polygon: {
    kilometers: t('unit.squarekilometers'),
    miles: t('unit.squaremiles'),
    meters: t('unit.squaremeters'),
    feet: t('unit.squarefeet'),
    yards: t('unit.squareyards')
  }
} as const

const modeGroups = [
  {
    mode: 'draw_line_string',
    title: t('measure.distance'),
    iconClass: 'sm-components-icon-line'
  },
  {
    mode: 'draw_polygon',
    title: t('measure.area'),
    iconClass: 'sm-components-icon-ploygon'
  },
  {
    mode: 'delete',
    title: t('measure.delete'),
    iconClass: 'sm-components-icon-delete'
  }
] as const

const activeMode = ref<(typeof modeGroups)[number]['mode']>()
const activeModeCache = ref<(typeof modeGroups)[number]['mode']>()
const result = ref('')
const measureFinished = ref(false)
const activeResultUnit = ref<Units>()

// 计算属性
const unitSelectorOptions = computed<Record<string, string>>(
  () => unitOptions[activeMode.value] ?? {}
)
const showResultUnitsSelector = computed(() => props.showUnitSelect && !!activeMode.value)
const unitSelected = computed<Units>({
  get() {
    if (activeResultUnit.value) {
      return activeResultUnit.value
    }
    return (
      activeMode.value === 'draw_line_string' ? props.distanceDefaultUnit : props.areaDefaultUnit
    ) as Units
  },
  set(val: Units) {
    activeResultUnit.value = val
  }
})

const unitResult = computed(() => {
  if (result.value && measureFinished.value) {
    const resultText = `${result.value} ${unitText.value}`
    resetActiveMode()
    return resultText
  }
  return ''
})

const unitText = computed(() => {
  const units = unitSelectorOptions.value
  return units[unitSelected.value]
})

const popupStyle = computed(() => ({
  background: popupBgStyle.value.background,
  color: textColorStyle.value.color
}))

const unitSelectorDropdownStyle = computed(() => ({
  background: removeColorOpacity(gisControlHeaderBgStyle.value.background)
}))

// 生命周期钩子
onMounted(() => {
  viewModel.on('measure-finished', measureFinishedFn)
  viewModel.on('measure-start', measureStartFn)
  viewModel.on('update-unit', updateUnitFn)

  drawEvent.on({
    'draw-reset': drawResetFn
  })
})

onBeforeUnmount(() => {
  viewModel.off('measure-finished', measureFinishedFn)
  viewModel.off('measure-start', measureStartFn)
  viewModel.off('update-unit', updateUnitFn)
  drawEvent.un({
    'draw-reset': drawResetFn
  })
})

function removed(map: Map, target: string) {
  drawEvent.deleteDrawingState(target, componentName)
  resetData()
}

function measureFinishedFn(e: any) {
  result.value = e.result
  measureFinished.value = true
}

function measureStartFn() {
  result.value = ''
  measureFinished.value = false
}

function updateUnitFn(e: any) {
  result.value = e.result
}

function drawResetFn({ componentName: name }: { componentName: string }) {
  if (name !== componentName) {
    activeMode.value = null
    result.value = ''
  }
}

function changeMeasureMode(mode: (typeof modeGroups)[number]['mode']) {
  setTimeout(() => {
    const mapNotLoaded = mapNotLoadedTip()
    if (mapNotLoaded) {
      return
    }
    if (!getMap().loaded()) {
      Message.destroy()
      Message.warning(t('warning.mapNotLoaded'))
    } else {
      if (mode === 'delete') {
        viewModel.trash()
        activeMode.value = null
        result.value = ''
        return
      }

      if (activeMode.value !== mode || !props.continueDraw) {
        viewModel.openDraw(mode, unitSelected.value, setPopupStyle)
        activeMode.value = mode
        props.continueDraw && drawEvent.notifyResetDraw(componentName)
      } else {
        viewModel.removeDraw(props.continueDraw)
        activeMode.value = null
      }
    }
  }, 0)
}

function updateUnit(unit: Units) {
  viewModel?.updateUnit(unit)
  setPopupStyle()
}

function getPopupContainer(triggerNode: HTMLElement) {
  return triggerNode.parentNode as HTMLElement
}

function resetActiveMode() {
  if (!activeModeCache.value) {
    activeModeCache.value = activeMode.value
  }
  if (measureFinished.value && !props.continueDraw) {
    activeMode.value = null
  }
  if (!measureFinished.value && props.continueDraw) {
    activeMode.value = activeModeCache.value
  }
}

function resetData() {
  activeMode.value = null
  result.value = ''
  props.continueDraw && drawEvent.notifyResetDraw(componentName)
}

// 提供对外方法：清空features
function clear() {
  activeMode.value = null
  result.value = ''
  viewModel?.clearAllFeatures()
}

function setPopupStyle(styleData = popupStyle.value) {
  nextTick(() => {
    const popupContentList = window.document.querySelectorAll(
      '.sm-component-measure__popup .mapboxgl-popup-content'
    ) as unknown as HTMLElement[]
    if (popupContentList) {
      popupContentList.forEach(item => {
        item.style.color = styleData.color
        item.style.background = styleData.background
      })
    }
    setPopupArrowStyle(styleData.background)
  })
}
</script>
