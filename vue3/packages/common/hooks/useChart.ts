import { ref, computed, watch, onMounted, onBeforeUnmount, onUpdated, nextTick } from 'vue'
import { isEqual, debounce, cloneDeep, merge } from 'lodash-es'
import { addListener, removeListener } from 'resize-detector'
import type { ChartProps } from '@supermapgis/mapboxgl/components/chart/types'
import { useTheme, useTimer } from '@supermapgis/common/hooks/index.common'
import {
  getMultiColorGroup,
  chartThemeUtil,
  handleMultiGradient
} from 'vue-iclient-core/utils/style/theme/chart'
import EchartsDataService from 'vue-iclient-core/utils/EchartsDataService'
import {
  getFeatureCenter,
  setPopupArrowStyle,
  getColorWithOpacity,
  getDecimalsFormatterVal
} from 'vue-iclient-core/utils/util'
import { ColorsPickerUtil } from 'vue-iclient-static/libs/iclient-common/iclient-common'
import { message as Message } from 'ant-design-vue'
import * as ECharts from 'echarts'

// 枚举事件类型
const EVENTS = [
  'legendselectchanged',
  'legendselected',
  'legendunselected',
  'legendscroll',
  'datazoom',
  'datarangeselected',
  'timelinechanged',
  'timelineplaychanged',
  'restore',
  'dataviewchanged',
  'magictypechanged',
  'geoselectchanged',
  'geoselected',
  'geounselected',
  'pieselectchanged',
  'pieselected',
  'pieunselected',
  'mapselectchanged',
  'mapselected',
  'mapunselected',
  'axisareaselected',
  'focusnodeadjacency',
  'unfocusnodeadjacency',
  'brush',
  'brushselected',
  'rendered',
  'finished',
  'click',
  'dblclick',
  'mouseover',
  'mouseout',
  'mousemove',
  'mousedown',
  'mouseup',
  'globalout',
  'contextmenu'
]

export function useChart({ props, emit, viewModel, chartRef, mapNotLoadedTip }: { props: ChartProps, emit: any, viewModel: any, chartRef: any, mapNotLoadedTip: () => boolean }) {
  // 响应式数据
  const chartTheme = ref({})
  const echartOptions = ref({})
  const datasetChange = ref(false)
  const dataSeriesCache = ref({})
  const tablePopupProps = ref({} as any)
  const startSpin = ref(null)
  const customSeries = ref([])
  const dataZoomHandler = ref<(params: any) => any>()
  const echartsDataService = ref<any>(null)
  const pieAutoPlay = ref<any>(null)
  const startAngle = ref<any>(null)
  let __resizeHandler: (element: any) => void

  useTimer(props, { timing })
  const { textColorStyle, containerBgStyle, colorGroup: colorGroupsData } = useTheme(props)

  const _optionsHandler = (options: any, dataOptions: any, dataZoomChanged: boolean = false) => {
    dataOptions = dataOptions && cloneDeep(dataOptions)
    options = options && cloneDeep(options)
    const extraSeries = []

    if (options && options.legend && !options.legend.type) {
      options.legend.type = 'scroll'
    }

    const yAxis = options.yAxis
    const xAxis = options.xAxis

    if (xAxis && dataOptions.xAxis) {
      handleAxis(options, dataOptions, xAxis, yAxis)
    }

    if (options && options.series && dataOptions.series) {
      handleSeries(dataOptions, options, dataZoomChanged, extraSeries)
    }

    if (options && options.radar && dataOptions.radar) {
      options.radar.indicator = Object.assign({}, dataOptions.radar.indicator || {})
      _handleRadarAxisLabelFormatter(options)
    }

    const series = dataOptions.series
    const isRingShine = options.series && options.series[0] && options.series[0].outerGap >= 0

    if (series && series.length && series[0].type === 'pie') {
      setItemStyleColor(false, series)
    }

    if (isRingShine) {
      dataOptions.series = _createRingShineSeries(series, options.series)
    }

    // 高亮选项处理
    if (options.highlightOptions && options.highlightOptions.length > 0) {
      if (isRingShine) {
        dataOptions.series = _createRingShineHighlight(series, options.highlightOptions)
      } else {
        setItemStyleColor(true, series)
      }
    }

    const mergeOptions = merge(options, dataOptions)
    if (extraSeries.length > 0) {
      mergeOptions.series.push(...extraSeries)
    }

    return mergeOptions
  }

  const _handlerColorGroup = (serielDataLength: number) => {
    if (typeof colorGroupsData.value[0] === 'object') {
      return handleMultiGradient(colorGroupsData.value, serielDataLength)
    } else {
      return ColorsPickerUtil.getGradientColors(colorGroupsData.value, serielDataLength, 'RANGE')
    }
  }

  const _controlLabel = (normalLabel: any, maxLabels: number) => {
    if (normalLabel && normalLabel.show && maxLabels) {
      const endNormalLabel = cloneDeep(normalLabel)
      let formatMode
      if (endNormalLabel.formatter && typeof endNormalLabel.formatter === 'string') {
        formatMode = endNormalLabel.formatter
      } else if (endNormalLabel.originFormatter) {
        formatMode = endNormalLabel.originFormatter
      }
      endNormalLabel.formatter = function ({ dataIndex, value, name, percent }: any) {
        name = getDecimalsFormatterVal(name, normalLabel.xFieldDecimals)
        value = getDecimalsFormatterVal(value, normalLabel.decimals)
        percent = getDecimalsFormatterVal(percent, normalLabel.decimals)
        const FORMATTER_MAP: Record<string, string> = {
          '{b}: {c}': `${name}: ${value}`,
          '{b}': `${name}`,
          '{c}': `${value}`,
          '{d}%': `${percent}%`
        }
        let result = ''
        if (dataIndex < maxLabels) {
          result = FORMATTER_MAP[formatMode || '{c}']
        }
        return result
      }
      return endNormalLabel
    }
    return normalLabel
  }

  // 计算属性
  const _chartStyle = computed(() => ({
    width: '100%',
    height: props.headerName ? 'calc(100% - 30px)' : '100%'
  }))

  const parseOptions = computed(() => {
    if (!props.options?.series) {
      return props.options
    }
    if (props.options.series.find((item: any) => item.type === '2.5Bar')) {
      return {
        ...props.options,
        series: []
      }
    }
    if (props.options.series[0] && props.options.series[0].customType === 'customRingsSeries') {
      return {
        ...props.options,
        series: [...props.options.series, ...customSeries.value]
      }
    }
    const series = props.options.series.map((serie: any) => {
      if (serie.label) {
        const cloneSerie = cloneDeep(serie)
        cloneSerie.label.normal = _controlLabel(cloneSerie.label.normal, cloneSerie.maxLabels)
        return cloneSerie
      }
      return serie
    })
    return {
      ...props.options,
      series
    }
  })

  const _chartOptions = computed(() => {
    return (_isRequestData.value && echartOptions.value) || parseOptions.value
  })

  // 是否传入dataset和datasetOptions
  const _isRequestData = computed(() => {
    return (
      props.dataset &&
      Object.keys(props.dataset).length > 0 &&
      (props.dataset.url || props.dataset.geoJSON) &&
      props.datasetOptions &&
      props.datasetOptions.length > 0
    )
  })

  const xBar = computed(() => {
    return props.options && props.options.yAxis && props.options.yAxis.type === 'category'
  })

  const colorNumber = computed(() => {
    const length =
      (props.datasetOptions && props.datasetOptions.length) ||
      (echartOptions.value.series && echartOptions.value.series.length)
    let colorNum = colorGroupsData.value.length
    if (length && length > colorNum) {
      colorNum = length
    }
    return colorNum
  })

  // 监听器
  watch(
    () => props.theme,
    () => {
      chartTheme.value = null
    }
  )

  watch(
    () => colorGroupsData.value,
    (newVal, oldVal) => {
      if (!isEqual(newVal, oldVal)) {
        _setChartTheme()
      }
    }
  )

  watch(
    () => textColorStyle.value,
    (newVal, oldVal) => {
      if (!isEqual(newVal, oldVal)) {
        _setChartTheme()
      }
    }
  )

  watch(
    () => containerBgStyle.value,
    (newVal, oldVal) => {
      if (!isEqual(newVal, oldVal)) {
        _setChartTheme()
      }
    }
  )

  watch(
    () => props.dataset,
    () => {
      if (_isRequestData.value) {
        _setEchartOptions(props.dataset, props.datasetOptions, props.options)
      }
      datasetChange.value = true
    },
    { deep: true }
  )

  watch(
    () => props.datasetOptions,
    (newVal, oldVal) => {
      if (!isEqual(newVal, oldVal)) {
        _setChartTheme()
        registerShape()
      }
      if (!echartsDataService.value && _isRequestData.value) {
        _setEchartOptions(props.dataset, props.datasetOptions, props.options)
      }
      if (echartsDataService.value) {
        echartsDataService.value.setDatasetOptions(props.datasetOptions)
      }
      if (echartsDataService.value && dataSeriesCache.value) {
        _changeChartData(echartsDataService.value, props.datasetOptions, props.options)
      }
    }
  )

  watch(
    () => props.options,
    () => {
      if (datasetChange.value && !dataSeriesCache.value) {
        return
      }
      if (dataSeriesCache.value && JSON.stringify(dataSeriesCache.value) !== '{}') {
        echartOptions.value = _optionsHandler(props.options, dataSeriesCache.value)
      } else {
        echartOptions.value = Object.assign({}, parseOptions.value)
      }
    },
    { deep: true }
  )

  watch(
    () => props.autoresize,
    () => {
      if (props.autoresize) {
        addListener(chartRef.value?.$el, __resizeHandler)
      } else {
        removeListener(chartRef.value?.$el, __resizeHandler)
      }
    }
  )

  watch(
    () => props.autoPlay,
    () => {
      _handlePieAutoPlay()
    }
  )

  watch(
    () => props.associatedMap,
    () => {
      if (!props.associatedMap) {
        clearPopup && clearPopup()
      }
    }
  )

  watch(
    () => props.highlightOptions,
    () => {
      setItemStyleColor()
    },
    { deep: true }
  )

  // 方法
  function _initAutoResize() {
    __resizeHandler = debounce(
      () => {
        resize()
      },
      100,
      { leading: true }
    )
    if (props.autoresize) {
      addListener(chartRef.value?.$el, __resizeHandler)
    }
  }

  function _initDataZoom() {
    dataZoomHandler.value = debounce(
      () => {
        _dataZoomChanged()
      },
      500,
      { leading: true }
    )
  }

  function setItemStyleColor(
    isSet = true,
    series?: any[],
    highlightOptions = props.highlightOptions,
    color = props.highlightColor
  ) {
    const targetSeries = series || cloneDeep(echartOptions.value?.series) || []
    targetSeries.forEach((serie: any, seriesIndex: number) => {
      const dataIndexs = highlightOptions.map((item: any) => {
        if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
          return item.dataIndex
        }
      })
      const colors = highlightOptions.map((item: any) => {
        if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
          return item.color || color
        }
      })
      const serieColor = props.options?.series?.[seriesIndex]?.itemStyle?.color
      serie.itemStyle = serie.itemStyle || { color: '' }
      serie.itemStyle.color = ({ dataIndex }: any) => {
        const index = dataIndexs.indexOf(dataIndex)
        if (index > -1) {
          return colors[index]
        } else if (serie.type === 'pie') {
          const colorGroup = _handlerColorGroup(serie.data.length)
          return colorGroup[dataIndex]
        } else {
          return serieColor
        }
      }
    })
    if (isSet) {
      echartOptions.value = { ...echartOptions.value, series: targetSeries }
    }
  }

  const handleAxis = (options: any, dataOptions: any, xAxis: any, yAxis: any) => {
    let axis = xAxis
    const axisData = dataOptions.xAxis[0]
    let type = 'xAxis'

    if (yAxis && yAxis.type === 'category') {
      // 处理条形图
      type = 'yAxis'
      axis = yAxis
      dataOptions.yAxis = dataOptions.xAxis
      delete dataOptions.xAxis
      _initAxisLabel(
        yAxis.axisLabel,
        yAxis.decimals,
        dataOptions.yAxis[0].data,
        options.visualMap,
        dataOptions.series
      )
      delete options.yAxis.decimals
    }

    if (dataOptions.series.length === 0) {
      axis = [{}]
    } else if (!Array.isArray(axis)) {
      if (axisData.data && axisData.data.length) {
        axis.data = []
      }
      axis = [Object.assign({}, axisData, axis)]
    }

    options[type] = axis
  }

  const handleSeries = (
    dataOptions: any,
    options: any,
    dataZoomChanged: boolean,
    extraSeries: any[]
  ) => {
    if (dataOptions.series.length === 0) {
      options.series = []
    } else {
      options.series = options.series.map((element: any, index: number) => {
        return Object.assign({}, element, dataOptions.series[index] || {})
      })

      const parallelShowNumber = getParallelShowNumber(options.series)

      if (options.series[0].shape === 'cylinder') {
        setCylinderXAxis(parallelShowNumber, options)
      }

      configureSeries(options, dataOptions, parallelShowNumber, dataZoomChanged, extraSeries)

      // 玫瑰图多个选中
      if (options.series[0].type === 'pie' && options.series[0].roseType) {
        options.series = options.series.map((serie: any) => {
          if (!serie.roseType) {
            serie.roseType = options.series[0].roseType
          }
          return serie
        })
      }

      // pie的图例需要一个扇形是一个图例
      if (options.legend && options.series.length > 0 && options.series[0].type === 'pie') {
        options.legend.data = []
        options.series.forEach((element: any) => {
          if (element.data) {
            options.legend.data.push(...element.data.map((item: any) => item.name))
          }
        })
      }
    }
  }

  const configureSeries = (
    options: any,
    dataOptions: any,
    parallelShowNumber: number,
    dataZoomChanged: boolean,
    extraSeries: any[]
  ) => {
    const dataZoom = options.dataZoom && options.dataZoom[0]
    const leftRightCount = parallelShowNumber / 2
    const baseSpace = 32
    let seriesSpace = 0
    let seriesSpaceCount = -Math.floor(leftRightCount)
    let seriesNameTag: string | null = null
    let colorIndex = 0

    options.series = options.series.map((serie: any, index: number) => {
      if (parallelShowNumber !== 0) {
        const serieName = serie.name.substring(serie.name.indexOf('-') + 1)
        if (!seriesNameTag) {
          seriesNameTag = serieName
          seriesSpace = getSericeSpace(parallelShowNumber, baseSpace, seriesSpaceCount)
        } else {
          if (seriesNameTag === serieName) {
            seriesSpace = getSericeSpace(parallelShowNumber, baseSpace, seriesSpaceCount)
          } else {
            seriesSpaceCount = -Math.floor(leftRightCount)
            seriesNameTag = serieName
            seriesSpace = getSericeSpace(parallelShowNumber, baseSpace, seriesSpaceCount)
            colorIndex += 1
          }
        }
        seriesSpaceCount += 1
      }

      const label = serie.label && serie.label.normal
      if (label && !label.smart) {
        serie.label.normal = _controlLabel(label, serie.maxLabels)
      }

      if (label && label.show && label.smart) {
        handleLabel(label, serie, options, dataZoom, dataZoomChanged)
      } else if (serie && serie.type !== 'pie' && serie.type !== 'radar') {
        const colorGroup = getMultiColorGroup(colorGroupsData.value, colorNumber.value)
        if (serie.type === '2.5Bar') {
          const shape = serie.shape
          const defaultColor = serie.itemStyle && serie.itemStyle.color
          if (['square', 'rectangle'].includes(shape)) {
            const cubeType = shape
            serie.type = 'custom'
            dataOptions.series[index] && (dataOptions.series[index].type = 'custom')
            serie.renderItem = _squareRectangleRenderItem(
              seriesSpace,
              defaultColor,
              colorGroup,
              cubeType,
              colorIndex
            )
          } else if (shape === 'cylinder') {
            handleCylinder(
              parallelShowNumber,
              dataOptions,
              index,
              serie,
              options,
              defaultColor,
              colorGroup,
              extraSeries
            )
          }
          delete serie.shape
        }
      }
      return serie
    })
  }

  const multipleYField = (optionSeries: any[]) => {
    const series = cloneDeep(optionSeries)
    const nameList = series.map(serie => {
      if (!serie.name.includes('-')) {
        return serie.name
      }
      const position = serie.name.indexOf('-')
      const prefix = serie.name.substring(0, position)
      if (isNaN(+prefix)) {
        return serie.name
      }
      return serie.name.substring(position + 1)
    })
    return series.length !== new Set(nameList).size
  }

  const getParallelShowNumber = (series: any[]) => {
    if (series.length === 0 || !multipleYField(series)) {
      // 0表示不进行并列显示
      return 0
    }
    let parallelShowNumber = 0
    const symbolPosition = series[0].name.indexOf('-')
    let firstSeriesName = series[0].name.substring(symbolPosition + 1)
    series.forEach(option => {
      const optionName = option.name.substring(symbolPosition + 1)
      if (firstSeriesName === optionName) {
        parallelShowNumber++
      }
    })
    return parallelShowNumber
  }

  const getSericeSpace = (
    parallelShowNumber: number,
    baseSpace: number,
    seriesSpaceCount: number
  ) => {
    if (parallelShowNumber === 0) return 0

    const leftRightCount = parallelShowNumber / 2
    const space = baseSpace * seriesSpaceCount

    if (seriesSpaceCount < 0) {
      return space - baseSpace * leftRightCount
    } else {
      return space + baseSpace * leftRightCount
    }
  }

  const handleLabel = (
    label: any,
    serie: any,
    options: any,
    dataZoom: any,
    dataZoomChanged: boolean
  ) => {
    label.position = label.position || 'top'
    let data = serie.data || []
    let startDataIndex = 0
    let endDataIndex = data.length > 0 ? data.length - 1 : 0
    if (dataZoom && dataZoom.show !== false) {
      if (dataZoom.start > dataZoom.end) {
        const oldStart = dataZoom.start
        dataZoom.start = dataZoom.end
        dataZoom.end = oldStart
      }
      if (dataZoomChanged) {
        const { startValue, endValue } = chartRef.value.chart.getOption().dataZoom[0] || {}
        startDataIndex = startValue
        endDataIndex = endValue
        options.dataZoom = options.dataZoom.map((val: any) => {
          if (startValue >= 0 && endValue >= 0) {
            val.startValue = startValue
            val.endValue = endValue
            delete val.start
            delete val.end
            return val
          }
          return val
        })
      } else {
        startDataIndex = Math.floor((dataZoom.start / 100) * data.length)
        endDataIndex = Math.ceil((dataZoom.end / 100) * data.length)
      }
      data = serie.data.slice(startDataIndex, endDataIndex + 1)
    }

    label.formatter = function ({ dataIndex, value }: any) {
      let result = ''
      if (
        dataIndex === startDataIndex ||
        dataIndex === endDataIndex ||
        Math.max.apply(null, data) + '' === value + ''
      ) {
        result = getDecimalsFormatterVal(value, label.decimals)
      }
      return result
    }
  }

  const _handleRadarAxisLabelFormatter = (options: any) => {
    if (typeof options.radar.decimals === 'number') {
      for (const key in options.radar.indicator) {
        const item = options.radar.indicator[key]
        item.text = getDecimalsFormatterVal(item.text, options.radar.decimals)
      }
      delete options.radar.decimals
    }
    return options
  }
  const _createRingShineDataOption = (data: any[], outerGap: number, isShine: boolean) => {
    if (!data) {
      return
    }
    const colors = _handlerColorGroup(data.length)
    const gapItem = {
      value: outerGap,
      name: '',
      itemStyle: {
        normal: {
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          color: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(0, 0, 0, 0)',
          borderWidth: 0
        }
      }
    }
    let result = []
    for (let i = 0; i < data.length; i++) {
      let dataItem: any = {
        value: data[i].value,
        name: data[i].name
      }
      if (isShine) {
        dataItem.itemStyle = {
          borderWidth: 5,
          shadowBlur: 10,
          color: colors[i],
          borderColor: colors[i],
          shadowColor: colors[i]
        }
      }
      result.push(dataItem)
      if (data.length > 1) {
        result.push(gapItem)
      }
    }
    return result
  }

  const _createRingShineSeries = (series: any[], optionsSeries: any[]) => {
    if (optionsSeries) {
      props.datasetOptions.forEach((datasetOption: any, index: number) => {
        let { type, outerGap, isShine } = optionsSeries[index] || {}
        if (type === 'pie' && outerGap >= 0) {
          const data = series[index].data.map((val: any) => val.value)
          outerGap = outerGap || Math.min.apply(null, data) / 5
          series[index].data = _createRingShineDataOption(series[index].data, outerGap, isShine)
          delete optionsSeries[index].outerGap
          delete optionsSeries[index].isShine
        }
      })
    }
    return series
  }

  const _createRingShineHighlight = (
    series: any[],
    highlightOptions: any[],
    color = props.highlightColor
  ) => {
    series = series || []
    series = series.map((serie: any, seriesIndex: number) => {
      const dataIndexs = highlightOptions.map((item: any) => {
        if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
          return item.dataIndex
        }
      })
      const colors = highlightOptions.map((item: any) => {
        if (item.seriesIndex && item.seriesIndex.includes(seriesIndex)) {
          return item.color || color
        }
      })
      const serieDatas = (serie && serie.data) || []
      dataIndexs.forEach((dataIndex: number, index: number) => {
        serieDatas[dataIndex].itemStyle.color = colors[index]
        serieDatas[dataIndex].itemStyle.borderColor = colors[index]
        serieDatas[dataIndex].itemStyle.shadowColor = colors[index]
      })
      return serie
    })
    return series
  }

  const setCylinderXAxis = (parallelShowNumber: number, options: any) => {
    if (parallelShowNumber === 0) {
      return
    }
    const xAixsType = options.xAxis[0] && options.xAxis[0].type
    for (let i = 1; i <= parallelShowNumber; i++) {
      options.xAxis.push({
        type: xAixsType,
        show: false
      })
    }
  }

  const getOffsetDistance = (parallelShowNumber: number, index: number) => {
    if (parallelShowNumber === 0) {
      return '100%'
    }
    let distance
    if (parallelShowNumber % 2) {
      distance = -100 * Math.floor(parallelShowNumber / 2) + (index % parallelShowNumber) * 100
      return `${distance}%`
    } else {
      distance =
        -100 * (Math.floor(parallelShowNumber / 2) - 0.5) + (index % parallelShowNumber) * 100
    }
    return `${distance}%`
  }
  const handleExtraSeries = (
    parallelShowNumber: number,
    dataOptions: any,
    index: number,
    serie: any,
    extraSeries: any[],
    cirCleColor: any,
    cirCleColorFnList: any[]
  ) => {
    const baseColumnWidth = parallelShowNumber !== 0 ? `${100 / parallelShowNumber}%` : '100%'
    const nextSerieDatas = dataOptions.series[index + 1] && dataOptions.series[index + 1].data
    const offsetDistance = getOffsetDistance(parallelShowNumber, index)
    const xAxisIndex =
      parallelShowNumber !== 0 ? Math.ceil((index + 1) / parallelShowNumber) - 1 : 0
    serie.xAxisIndex = xAxisIndex
    extraSeries.push(
      // 头部的圆片
      {
        name: parallelShowNumber !== 0 ? serie.name : '',
        type: 'pictorialBar',
        symbolOffset: parallelShowNumber !== 0 ? [offsetDistance, '-50%'] : [0, -8],
        xAxisIndex: parallelShowNumber !== 0 ? xAxisIndex : 0,
        symbolPosition: 'end',
        z: 12,
        itemStyle: {
          normal: {
            color: cirCleColorFnList[0] || cirCleColor
          }
        },
        data: dataOptions.series[index].data.map((item: any, dataIndex: number) => {
          if (parallelShowNumber !== 0) {
            return {
              value: item,
              symbolSize: [baseColumnWidth, 15]
            }
          } else {
            return {
              value: item,
              symbolSize:
                !nextSerieDatas ||
                (nextSerieDatas[dataIndex] && +item >= +nextSerieDatas[dataIndex])
                  ? [baseColumnWidth, 15]
                  : [0, 15]
            }
          }
        })
      },
      {
        // 底部的圆片
        name: parallelShowNumber !== 0 ? serie.name : '',
        type: 'pictorialBar',
        xAxisIndex: parallelShowNumber !== 0 ? xAxisIndex : 0,
        symbolSize: parallelShowNumber !== 0 ? [baseColumnWidth, 10] : [offsetDistance, 10],
        symbolOffset: parallelShowNumber !== 0 ? [offsetDistance, '50%'] : [0, 5],
        z: 12,
        itemStyle: {
          normal: {
            color: cirCleColorFnList[1] || cirCleColor
          }
        },
        data: dataOptions.series[index].data
      }
    )
  }

  const setGradientColor = (color: any, nextColor: any) => {
    if (typeof color === 'string') {
      return new graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color },
        { offset: 1, color: nextColor || color }
      ])
    }
    return color
  }

  const handleCylinder = (
    parallelShowNumber: number,
    dataOptions: any,
    index: number,
    serie: any,
    options: any,
    defaultColor: any,
    colorGroup: any[],
    extraSeries: any[]
  ) => {
    serie.type = 'bar'
    serie.barGap = parallelShowNumber === 0 ? '-100%' : '0'
    if (parallelShowNumber !== 0) {
      const serieColor = defaultColor || colorGroup[Math.ceil((index + 1) / parallelShowNumber) - 1]
      if (serie.itemStyle) {
        serie.itemStyle.color = setGradientColor(serieColor, '#fff')
      } else {
        serie.itemStyle = {}
        serie.itemStyle.color = setGradientColor(serieColor, '#fff')
      }
    }
    options.tooltip && options.tooltip.trigger === 'axis' && (options.tooltip.trigger = 'item')
    dataOptions.series[index] && (dataOptions.series[index].type = 'bar')
    const colorIndex =
      parallelShowNumber !== 0 ? Math.ceil((index + 1) / parallelShowNumber) - 1 : index
    let cirCleColor = defaultColor || colorGroup[colorIndex]
    let cirCleColorFnList = []
    if (typeof cirCleColor === 'string') {
      cirCleColor = setGradientColor(cirCleColor, '#fff')
    }
    if (props.highlightOptions && props.highlightOptions.length > 0) {
      const matchDataList = []
      props.highlightOptions.forEach((item: any) => {
        if (item.seriesIndex.includes(index)) {
          let color = item.color || props.highlightColor
          if (typeof color === 'string') {
            color = setGradientColor(color, '#fff')
          }
          matchDataList.push({ dataIndex: item.dataIndex, color })
        }
      })
      if (matchDataList.length > 0) {
        cirCleColorFnList = ['topCirCleColorFn', 'bottomCirCleColorFn'].map(() => {
          return ({ dataIndex }: any) => {
            const matchData = matchDataList.find((item: any) => item.dataIndex === dataIndex)
            return matchData ? matchData.color : cirCleColor
          }
        })
      }
    }
    handleExtraSeries(
      parallelShowNumber,
      dataOptions,
      index,
      serie,
      extraSeries,
      cirCleColor,
      cirCleColorFnList
    )
  }

  const _squareRectangleRenderItem = (
    seriesSpace: number,
    defaultColor: any,
    colorGroup: any[],
    cubeType: string,
    colorIndex: number
  ) => {
    return (params: any, api: any) => {
      const location = api.coord([api.value(0), api.value(1)])
      let fillColor = defaultColor || colorGroup[colorIndex]
      if (props.highlightOptions && props.highlightOptions.length > 0) {
        const matchData = props.highlightOptions.find(
          (item: any) =>
            item.seriesIndex.includes(params.seriesIndex) && item.dataIndex === params.dataIndex
        )
        if (matchData && (matchData.color || props.highlightColor)) {
          fillColor = matchData.color || props.highlightColor
        }
      }
      let leftColor, rightColor, topColor
      if (typeof fillColor === 'object') {
        const copyLeftColor = cloneDeep(fillColor)
        const copyRightColor = cloneDeep(fillColor)
        const copyTopColor = cloneDeep(fillColor)
        copyLeftColor.colorStops[0].color = getColorWithOpacity(
          copyLeftColor.colorStops[0].color,
          0.4
        )
        copyLeftColor.colorStops[1].color = getColorWithOpacity(
          copyLeftColor.colorStops[1].color,
          0.4
        )
        copyRightColor.colorStops[0].color = getColorWithOpacity(
          copyRightColor.colorStops[0].color,
          0.7
        )
        copyRightColor.colorStops[1].color = getColorWithOpacity(
          copyRightColor.colorStops[1].color,
          0.7
        )
        copyTopColor.colorStops[0].color = getColorWithOpacity(
          copyTopColor.colorStops[0].color,
          0.85
        )
        copyTopColor.colorStops[1].color = getColorWithOpacity(
          copyTopColor.colorStops[1].color,
          0.85
        )
        leftColor = copyLeftColor
        rightColor = copyRightColor
        topColor = copyTopColor
      } else {
        leftColor = getColorWithOpacity(fillColor, 0.4)
        rightColor = getColorWithOpacity(fillColor, 0.7)
        topColor = getColorWithOpacity(fillColor, 0.85)
      }
      return {
        type: 'group',
        children: [
          {
            type: `Cube${cubeType}Left`,
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0] + seriesSpace,
              y: location[1],
              bottomYAxis: api.coord([api.value(0), 0])[1]
            },
            style: {
              fill: leftColor
            }
          },
          {
            type: `Cube${cubeType}Right`,
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0] + seriesSpace,
              y: location[1],
              bottomYAxis: api.coord([api.value(0), 0])[1]
            },
            style: {
              fill: rightColor
            }
          },
          {
            type: `Cube${cubeType}Top`,
            shape: {
              api,
              xValue: api.value(0),
              yValue: api.value(1),
              x: location[0] + seriesSpace,
              y: location[1],
              bottomYAxis: api.coord([api.value(0), 0])[1]
            },
            style: {
              fill: topColor
            }
          }
        ]
      }
    }
  }

  const getStringColor = (color: any) => {
    if (color instanceof Object) {
      return ((color.colorStops || [])[0] || {}).color
    }
    return color
  }

  const _initAxisLabel = (
    axisLabel: any,
    decimals: number,
    data: any[],
    visualMap: any,
    series: any
  ) => {
    if (!xBar.value) {
      return
    }
    const sortSeriesIndex = props.datasetOptions.findIndex(
      (item: any) => item.sort !== 'unsort' && item.rankLabel
    )
    if (sortSeriesIndex > -1 && axisLabel && data) {
      const orderNumLength = data.length.toString().length
      for (
        let index = 0, len = data.length, rankIndex = len - 1;
        index < len;
        index++, rankIndex--
      ) {
        const paddedNumber = rankIndex.toString().padStart(orderNumLength, '0')
        data[index] = `${paddedNumber}${data[index]}`
      }
      const firstVisualMap =
        visualMap && visualMap.find((item: any) => item.seriesIndex === sortSeriesIndex)
      axisLabel.rich = axisLabel.rich || {}
      axisLabel.rich.default = {
        backgroundColor: getStringColor(props.colorGroup[sortSeriesIndex]),
        width: 20,
        height: 20,
        align: 'center',
        borderRadius: 2
      }
      firstVisualMap &&
        firstVisualMap.pieces.forEach((item: any, index: number) => {
          axisLabel.rich[`color_${index}`] = {
            backgroundColor: item.color,
            width: 20,
            height: 20,
            align: 'center',
            borderRadius: 2
          }
        })
      const serieData = series && series[sortSeriesIndex].data
      axisLabel.formatter = function (label: string, index: number) {
        const orderNum = parseInt(label.slice(0, orderNumLength)) + 1
        const leftLabel = getDecimalsFormatterVal(label.slice(orderNumLength), decimals)
        const labelValue = serieData && +serieData[index]
        if (firstVisualMap) {
          const matchItemIndex = firstVisualMap.pieces.findIndex((item: any) => {
            let condition = true
            if (item.min) {
              condition = condition && labelValue >= item.min
            }
            if (item.max) {
              condition = condition && labelValue <= item.max
            }
            if (item.lte) {
              condition = condition && labelValue <= item.lte
            }
            if (item.gte) {
              condition = condition && labelValue >= item.gte
            }
            if (item.lt) {
              condition = condition && labelValue < item.lt
            }
            if (item.gt) {
              condition = condition && labelValue > item.gt
            }
            if (item.value) {
              condition = condition && labelValue === item.value
            }
            return condition
          })
          if (matchItemIndex > -1) {
            return [`{color_${matchItemIndex}|${orderNum}}  ${leftLabel}`].join('\n')
          }
        }
        return [`{default|${orderNum}}  ${leftLabel}`].join('\n')
      }
    }
  }

  function _handlePieAutoPlay() {
    const seriesType = _chartOptions.value?.series?.[0]?.type
    const echartsNode = chartRef.value?.chart
    if (_chartOptions.value?.legend?.data?.length && echartsNode && seriesType === 'pie') {
      clearPieAutoPlay(echartsNode)
      if (props.autoPlay) {
        setPieAutoPlay(echartsNode)
      }
    }
  }

  function setPieAutoPlay(echartsNode: any) {
    let i = -1
    pieAutoPlay.value = setInterval(() => {
      echartsNode.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: i
      })
      i++
      if (i >= _chartOptions.value.legend.data.length) {
        i = 0
      }
      echartsNode.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: i
      })
    }, 2000)
  }

  function clearPieAutoPlay(echartsNode: any) {
    clearInterval(pieAutoPlay.value)
    for (let i = 0; i < _chartOptions.value.legend.data.length; i++) {
      echartsNode.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: i
      })
    }
  }

  function timing() {
    if (echartsDataService.value) {
      echartsDataService.value.getDataOption(props.dataset, xBar.value).then((options: any) => {
        hideLoading()
        // 缓存dataSeriesCache，请求后格式化成echart的数据
        dataSeriesCache.value = Object.assign({}, options)
        datasetChange.value = false
        // 设置echartOptions
        echartOptions.value = _optionsHandler(props.options, options)
      })
    }
  }

  // 请求数据,设置echartOptions
  function _setEchartOptions(dataset: any, datasetOptions: any, echartOptionsParam: any) {
    echartsDataService.value = null
    dataSeriesCache.value = null

    if (dataset.type !== 'geoJSON') {
      showLoading('default', {
        text: 'info.loading',
        color: colorGroupsData.value[0],
        textColor: textColorStyle.value,
        maskColor: 'rgba(0,0,0,0.8)',
        zlevel: 0
      })
    }

    echartsDataService.value = new EchartsDataService(dataset, datasetOptions)
    echartsDataService.value.getDataOption(dataset, xBar.value).then((options: any) => {
      hideLoading()
      dataSeriesCache.value = Object.assign({}, options)
      datasetChange.value = false
      echartOptions.value = _optionsHandler(echartOptionsParam, options)
    })
  }

  function _changeChartData(echartsDataService: any, datasetOptions: any, echartOptionsParam: any) {
    const options = echartsDataService.formatChartData(datasetOptions, xBar.value)
    dataSeriesCache.value = Object.assign({}, options)
    echartOptions.value = _optionsHandler(echartOptionsParam, options)
  }

  function _setChartTheme() {
    if (!props.theme) {
      chartTheme.value = chartThemeUtil(
        containerBgStyle.value.background,
        textColorStyle.value,
        colorGroupsData.value,
        colorNumber.value
      )
    }
  }

  function _getEchart() {
    return chartRef.value
  }

  // 以下全是同名调用echart的方法
  /**
   * 提供了一个更贴切的名称来描述 setOption 方法的实际行为。
   * @param {Object} options - 图表的配置项和数据
   * @param {Boolean} [notMerge = false] - 可选，是否不跟之前设置的 option 进行合并，默认为 false，即合并
   * @param {Boolean} [lazyUpdate = false] - 可选，阻止调用 setOption 时抛出事件，默认为 false，即抛出事件
   */
  const mergeOptions = (options: Record<string, any>, notMerge?: boolean, lazyUpdate?: boolean) => {
    _delegateMethod('mergeOptions', options, notMerge, lazyUpdate)
  }

  /**
   * 此接口用于，在大数据量（百万以上）的渲染场景，分片加载数据和增量渲染。
   * @param {Object} params - 数据配置
   */
  const appendData = (params: Record<string, any>) => {
    _delegateMethod('appendData', params)
  }

  /**
   * 此接口用于，改变图表尺寸，在容器大小发生改变时需要手动调用。
   * @param {Object} [options] - options可缺省。有下面几个可选项：width, height, silent
   */
  const resize = (options?: { width?: number; height?: number; silent?: boolean }) => {
    _delegateMethod('resize', options)
  }

  /**
   * 此接口用于，触发图表行为。
   * @param {Object} payload - 参数可以通过batch属性同时触发多个行为。
   */
  const dispatchAction = (payload: Record<string, any>) => {
    _delegateMethod('dispatchAction', payload)
  }

  /**
   * 此接口用于，转换坐标系上的点到像素坐标值。
   * @param {Object} finder - 用于指示『在哪个坐标系或者系列上判断』。
   * @param {Array|string} value - 要被转换的值。
   */
  const convertToPixel = (finder: Record<string, any>, value: number[] | string) => {
    _delegateMethod('convertToPixel', finder, value)
  }

  /**
   * 此接口用于，转换像素坐标值到逻辑坐标系上的点。是 convertToPixel 的逆运算。
   * @param {Object} finder - 用于指示『在哪个坐标系或者系列上判断』。
   * @param {Array|string} value - 要被转换的值。
   */
  const convertFromPixel = (finder: Record<string, any>, value: number[] | string) => {
    _delegateMethod('convertFromPixel', finder, value)
  }

  /**
   * 此接口用于，判断给定的点是否在指定的坐标系或者系列上。
   * @param {Object} finder - 用于指示『在哪个坐标系或者系列上判断』。
   * @param {Array} value - 要被判断的点。
   */
  const containPixel = (finder: Record<string, any>, value: number[]) => {
    return _delegateMethod('containPixel', finder, value)
  }

  /**
   * 此接口用于，显示加载动画效果。可以在加载数据前手动调用该接口显示加载动画，在数据加载完成后调用 hideLoading 隐藏加载动画。
   * @param {Object} [type] - 可选，加载动画类型，目前只有一种'default'。
   * @param {Object} [options] - 可选，加载动画配置项，跟type有关。
   */
  const showLoading = (type?: string, options?: Record<string, any>) => {
    _delegateMethod('showLoading', type, options)
  }

  /**
   * 此接口用于，隐藏动画加载效果。
   */
  const hideLoading = () => {
    _delegateMethod('hideLoading')
  }

  /**
   * 此接口用于，导出图表图片，返回一个 base64 的 URL，可以设置为Image的src。
   * @param {Object} options - 导出配置
   */
  const getDataURL = (options: Record<string, any>) => {
    return _delegateMethod('getDataURL', options)
  }

  /**
   * 此接口用于，导出联动的图表图片，返回一个 base64 的 url，可以设置为Image的src。导出图片中每个图表的相对位置跟容器的相对位置有关。
   * @param {Object} options - 导出配置
   */
  const getConnectedDataURL = (options: Record<string, any>) => {
    return _delegateMethod('getConnectedDataURL', options)
  }

  /**
   * 此接口用于，清空当前实例，会移除实例中所有的组件和图表。清空后调用 getOption 方法返回一个空对象（{}）。
   */
  const clear = () => {
    _delegateMethod('clear')
  }

  /**
   * 此接口用于，销毁实例，销毁后实例无法再被使用。
   */
  const dispose = () => {
    _delegateMethod('dispose')
  }

  // 内部调用的方法
  function _delegateMethod(methodName: string, ...args: any[]): any {
    if (chartRef.value && chartRef.value[methodName]) {
      return chartRef.value[methodName](...args)
    }
  }

  function unSupportedFeatureTip() {
    Message.destroy()
    Message.warning('chart.unSupportedData')
  }

  function handleChartClick(params: Record<string, any>) {
    if (props.associatedMap) {
      const { dataIndex } = params
      let features: Record<string, any>[] = []
      if (echartsDataService.value && echartsDataService.value.sortDataCache) {
        features = echartsDataService.value.sortDataCache.features || features
      }
      const selectedFeature = features[dataIndex]
      showDetailInfo(selectedFeature)
    }
  }

  function showDetailInfo(feature: Record<string, any>) {
    const coordinates = ((feature || {}).geometry || {}).coordinates
    const hasCoordinates = coordinates && !!coordinates.length
    if (hasCoordinates && viewModel.value) {
      const properties = feature.properties || {}
      const centerCoordinates = getFeatureCenter(feature)
      const propsData = generateTableData(properties)
      tablePopupProps.value = { ...propsData, visible: true }
      nextTick(() => {
        viewModel.value?.setPopupContent(centerCoordinates, tablePopupProps.value.$el, () =>
          setPopupArrowStyle(tablePopupProps.value.background)
        )
      })
    } else {
      const mapNotLoaded = mapNotLoadedTip()
      if (mapNotLoaded) {
        return
      }
      if (!hasCoordinates) {
        unSupportedFeatureTip()
      }
    }
  }

  function generateTableData(properties: Record<string, any>) {
    const propsData = {
      columns: [
        { title: 'search.attribute', dataIndex: 'attribute', width: 120 },
        { title: 'search.attributeValue', dataIndex: 'attributeValue', width: 150 }
      ],
      data: [] as Record<string, any>[]
    }
    for (let key in properties) {
      if (key && properties[key]) {
        const dataItem = {
          attribute: key,
          attributeValue: properties[key]
        }
        propsData.data.push(dataItem)
      }
    }
    return propsData
  }

  // function mapNotLoadedTip() {}

  function _dataZoomChanged() {
    let flag = false
    props.options?.series?.forEach((serie: any) => {
      const labelConfig = serie.label && serie.label.normal
      flag = labelConfig?.show && labelConfig?.smart
    })
    if (flag) {
      echartOptions.value = _optionsHandler(props.options, dataSeriesCache.value, true)
    }
  }

  function registerShape() {
    if (!props.datasetOptions || !props.options?.series) return

    props.datasetOptions.forEach((item: any, index: number) => {
      const graphicIntance = graphic
      if (!graphicIntance) return

      if (item.seriesType === '2.5Bar') {
        const cubeType = props.options.series[index].shape
        if (graphicIntance.getShapeClass(`Cube${cubeType}Left`)) {
          return
        }

        let CubeLeft: any, CubeRight: any, CubeTop: any
        switch (cubeType) {
          case 'square':
            // 绘制左侧面
            CubeLeft = graphicIntance.extendShape({
              shape: {
                x: 0,
                y: 0
              },
              buildPath: function (ctx: any, shape: any) {
                const bottomYAxis = shape.bottomYAxis
                const c0 = [shape.x, shape.y]
                const c1 = [shape.x - 13, shape.y - 13]
                const c2 = [shape.x - 13, bottomYAxis - 13]
                const c3 = [shape.x, bottomYAxis]
                ctx
                  .moveTo(c0[0], c0[1])
                  .lineTo(c1[0], c1[1])
                  .lineTo(c2[0], c2[1])
                  .lineTo(c3[0], c3[1])
                  .closePath()
              }
            })
            // 绘制右侧面
            CubeRight = graphicIntance.extendShape({
              shape: {
                x: 0,
                y: 0
              },
              buildPath: function (ctx: any, shape: any) {
                const bottomYAxis = shape.bottomYAxis
                const c1 = [shape.x, shape.y]
                const c2 = [shape.x, bottomYAxis]
                const c3 = [shape.x + 18, bottomYAxis - 9]
                const c4 = [shape.x + 18, shape.y - 9]
                ctx
                  .moveTo(c1[0], c1[1])
                  .lineTo(c2[0], c2[1])
                  .lineTo(c3[0], c3[1])
                  .lineTo(c4[0], c4[1])
                  .closePath()
              }
            })
            // 绘制顶面
            CubeTop = graphicIntance.extendShape({
              shape: {
                x: 0,
                y: 0
              },
              buildPath: function (ctx: any, shape: any) {
                const c1 = [shape.x, shape.y]
                const c2 = [shape.x + 18, shape.y - 9]
                const c3 = [shape.x + 5, shape.y - 22]
                const c4 = [shape.x - 13, shape.y - 13]
                ctx
                  .moveTo(c1[0], c1[1])
                  .lineTo(c2[0], c2[1])
                  .lineTo(c3[0], c3[1])
                  .lineTo(c4[0], c4[1])
                  .closePath()
              }
            })
            break
          case 'rectangle':
            // 绘制左侧面
            CubeLeft = graphicIntance.extendShape({
              shape: {
                x: 0,
                y: 0
              },
              buildPath: function (ctx: any, shape: any) {
                const bottomYAxis = shape.bottomYAxis
                const c0 = [shape.x, shape.y]
                const c1 = [shape.x - 13, shape.y - 13]
                const c2 = [shape.x - 13, bottomYAxis - 13]
                const c3 = [shape.x, bottomYAxis]
                ctx
                  .moveTo(c0[0], c0[1])
                  .lineTo(c1[0], c1[1])
                  .lineTo(c2[0], c2[1])
                  .lineTo(c3[0], c3[1])
                  .closePath()
              }
            })
            // 绘制右侧面
            CubeRight = graphicIntance.extendShape({
              shape: {
                x: 0,
                y: 0
              },
              buildPath: function (ctx: any, shape: any) {
                const bottomYAxis = shape.bottomYAxis
                const c1 = [shape.x, shape.y]
                const c2 = [shape.x, bottomYAxis]
                const c3 = [shape.x + 18, bottomYAxis - 9]
                const c4 = [shape.x + 18, shape.y - 9]
                ctx
                  .moveTo(c1[0], c1[1])
                  .lineTo(c2[0], c2[1])
                  .lineTo(c3[0], c3[1])
                  .lineTo(c4[0], c4[1])
                  .closePath()
              }
            })
            // 绘制顶面
            CubeTop = graphicIntance.extendShape({
              shape: {
                x: 0,
                y: 0
              },
              buildPath: function (ctx: any, shape: any) {
                const c1 = [shape.x, shape.y]
                const c2 = [shape.x + 18, shape.y - 9]
                const c3 = [shape.x + 5, shape.y - 22]
                const c4 = [shape.x - 13, shape.y - 13]
                ctx
                  .moveTo(c1[0], c1[1])
                  .lineTo(c2[0], c2[1])
                  .lineTo(c3[0], c3[1])
                  .lineTo(c4[0], c4[1])
                  .closePath()
              }
            })
            break
        }

        if (CubeLeft) graphicIntance.registerShape('Cube' + cubeType + 'Left', CubeLeft)
        if (CubeRight) graphicIntance.registerShape('Cube' + cubeType + 'Right', CubeRight)
        if (CubeTop) graphicIntance.registerShape('Cube' + cubeType + 'Top', CubeTop)
      }
    })
  }

  function getCirlPoint(x0: number, y0: number, r: number, angle: number) {
    let x1 = x0 + r * Math.cos((angle * Math.PI) / 180)
    let y1 = y0 + r * Math.sin((angle * Math.PI) / 180)
    return {
      x: x1,
      y: y1
    }
  }

  function spinLine(
    startAngle: number,
    endAngle: number,
    angle: number,
    effectColor: string,
    radius: number
  ) {
    return (params: any, api: any) => {
      return {
        type: 'arc',
        shape: {
          cx: api.getWidth() / 2,
          cy: api.getHeight() / 2,
          r: (Math.min(api.getWidth(), api.getHeight()) / 2) * radius,
          startAngle: ((startAngle + angle) * Math.PI) / 180,
          endAngle: ((endAngle + angle) * Math.PI) / 180
        },
        style: {
          stroke: effectColor,
          fill: 'transparent',
          lineWidth: 1.5
        },
        silent: true
      }
    }
  }

  function spinPoint(angle: number, spinAngle: number, effectColor: string, radius: number) {
    return (params: any, api: any) => {
      const x0 = api.getWidth() / 2
      const y0 = api.getHeight() / 2
      const r = (Math.min(api.getWidth(), api.getHeight()) / 2) * radius
      const point = getCirlPoint(x0, y0, r, angle + spinAngle)
      return {
        type: 'circle',
        shape: {
          cx: point.x,
          cy: point.y,
          r: 4
        },
        style: {
          stroke: effectColor,
          fill: effectColor
        },
        silent: true
      }
    }
  }

  function customRingsLine(
    startAngle: number,
    endAngle: number,
    angle: number,
    effectColor: string,
    effectRadius: number
  ) {
    let series = {
      name: 'ring0',
      type: 'custom',
      coordinateSystem: 'none',
      renderItem: null,
      data: [0]
    }
    series.renderItem = spinLine(startAngle, endAngle, angle, effectColor, effectRadius)
    return series
  }

  function customRingsPoint(
    startAngle: number,
    angle: number,
    effectColor: string,
    outEffectRadius: number
  ) {
    let series = {
      name: 'ring4',
      type: 'custom',
      coordinateSystem: 'none',
      renderItem: null,
      data: [0]
    }
    series.renderItem = spinPoint(startAngle, angle, effectColor, outEffectRadius)
    return series
  }

  function addEffect(angle: number) {
    angle = angle || 0
    const effectColor = props.options?.series?.[0]?.customOptions?.color
    const effectRadius = props.options?.series?.[0]?.customOptions?.radius
    const outEffectRadius = effectRadius + 0.1
    // customRightBottomLine
    customSeries.value.push(customRingsLine(0, 90, angle, effectColor, effectRadius))
    // customRightTopLine
    customSeries.value.push(customRingsLine(270, 40, -angle, effectColor, outEffectRadius))
    // customLeftTopLine
    customSeries.value.push(customRingsLine(180, 270, angle, effectColor, effectRadius))
    // customLeftBottomLine
    customSeries.value.push(customRingsLine(90, 220, -angle, effectColor, outEffectRadius))
    if (props.options?.series?.[0]?.customOptions?.pointState === 'startPoint') {
      customSeries.value.push(customRingsPoint(270, -angle, effectColor, outEffectRadius))
      customSeries.value.push(customRingsPoint(90, -angle, effectColor, outEffectRadius))
    }
  }

  function startEffect() {
    let angle = 0
    startSpin.value = setInterval(() => {
      if (!props.options?.series) {
        return
      }
      if (props.options.series[0].customType === 'customRingsSeries') {
        customSeries.value = []
        angle += 3
        addEffect(angle)
      }
    }, 100)
  }

  function clearPopup() {
    if (viewModel.value) {
      viewModel.value.setPopupContent(null, null)
    }
  }

  // echarts所有静态方法
  /**
   * @function connect
   * 多个图表实例实现联动。
   * @param {string|Array} group - group的id，或者图表实例的数组。
   */
  function connect(group: string | any[]) {
    ECharts && ECharts.connect(group)
  }

  /**
   * 解除图表实例的联动，如果只需要移除单个实例，可以将通过将该图表实例 group 设为空。
   * @param {string} group - group的id。
   */
  function disconnect(group: string) {
    ECharts && ECharts.disconnect(group)
  }

  /**
   * 注册可用的地图，必须在包括 geo 组件或者 map 图表类型的时候才能使用。
   * @param {string} mapName - 地图名称，在 geo 组件或者 map 图表类型中设置的 map 对应的就是该值。
   * @param {Object} geoJSON - GeoJson 格式的数据，具体格式见 http://geojson.org/。
   * @param {Object} [specialAreas] - 可选。将地图中的部分区域缩放到合适的位置，可以使得整个地图的显示更加好看。
   */
  function registerMap(mapName: string, geoJSON: any, specialAreas?: any) {
    ECharts && ECharts.registerMap(mapName, geoJSON, specialAreas)
  }

  /**
   * 注册主题，用于初始化实例的时候指定。
   * @param {string} name - 主题命名。
   * @param {Object} theme - 主题配置。
   */
  function registerTheme(name: string, theme: any) {
    ECharts && ECharts.registerTheme(name, theme)
  }

  /**
   * @desc 图形相关帮助方法。
   */
  const graphic = ECharts?.graphic

  // 初始化
  _setChartTheme()
  registerShape()
  onMounted(() => {
    const smChart = _getEchart().chart
    // 派发echart所有事件
    EVENTS.forEach(event => {
      smChart?.on(event, (params: any) => {
        if (event === 'click') {
          handleChartClick(params)
        }
        emit(event, params)
      })
    })

    _initAutoResize()
    _initDataZoom()

    if (props.options?.series?.[0]?.customType === 'customRingsSeries') {
      startEffect()
    }

    if (!_isRequestData.value && props.autoPlay) {
      _handlePieAutoPlay()
    }

    if (_isRequestData.value) {
      _setEchartOptions(props.dataset, props.datasetOptions, props.options)
    }
  })

  onUpdated(() => {
    _handlePieAutoPlay()
  })

  onBeforeUnmount(() => {
    clearInterval(pieAutoPlay.value)
    clearInterval(startAngle.value)
    if (props.autoresize) {
      removeListener(chartRef.value?.$el, __resizeHandler)
    }
  })

  return {
    // 响应式数据
    chartTheme,
    tablePopupProps,

    // 计算属性
    _chartStyle,
    _chartOptions,

    // 方法
    mergeOptions,
    appendData,
    resize,
    dispatchAction,
    convertToPixel,
    convertFromPixel,
    containPixel,
    showLoading,
    hideLoading,
    getDataURL,
    getConnectedDataURL,
    clear,
    dispose,
    setItemStyleColor,
    handleChartClick,
    dataZoomHandler,

    // ECharts静态方法
    connect,
    disconnect,
    registerMap,
    registerTheme,
    graphic
  }
}
