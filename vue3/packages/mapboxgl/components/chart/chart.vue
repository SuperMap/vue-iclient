<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :split-line="splitLine"
    class="sm-component-chart"
  >
    <v-chart
      :id="chartId"
      ref="chartRef"
      :option="_chartOptions as any"
      :init-options="initOptions"
      :group="group"
      :manual-update="manualUpdate"
      :theme="theme || chartTheme"
      :style="_chartStyle"
      @datazoom="dataZoomHandler as any"
    />
    <TablePopup
      v-show="false"
      ref="chartTablePopup"
      v-bind="tablePopupProps"
      :split-line="splitLine"
      :text-color="textColor"
      :background="background"
    />
  </sm-collapse-card>
</template>

<script setup lang="ts">
import 'echarts'
import VChart from 'vue-echarts'
import UniqueId from 'lodash.uniqueid'
import { useTemplateRef } from 'vue'
import type { ChartProps, ChartEmits } from './types'
import { chartPropsDefault } from './types'
import { useChart, useMapGetter } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import ChartViewModel from 'vue-iclient-controllers-mapboxgl/src/ChartViewModel'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import TablePopup from '@supermapgis/common/components/table-popup/table-popup.vue'
import type { Map } from 'mapbox-gl'

const name = 'SmChart'
defineOptions({
  name
})

const props = withDefaults(defineProps<ChartProps>(), chartPropsDefault)
const emit = defineEmits<ChartEmits>()
const chartId = UniqueId(`${name.toLowerCase()}-`)

const viewModel = new ChartViewModel()
const chartRef = useTemplateRef('chartRef')

useMapControl()
const { mapNotLoadedTip } = useMapGetter<Map>({
  viewModel
})
const {
  chartTheme,
  _chartOptions,
  _chartStyle,
  tablePopupProps,
  dataZoomHandler,
  getChartFeatures,
  mergeOptions,
  resize,
  dispatchAction,
  setItemStyleColor,
  smChart
} = useChart({ props, emit, viewModel, chartRef, mapNotLoadedTip })

defineExpose({
  getChartFeatures,
  mergeOptions,
  resize,
  dispatchAction,
  setItemStyleColor,
  smChart
})
</script>
