import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, ref } from 'vue'
import { init, use } from 'echarts'
import { radarNodeStyleExtension } from '../../utils/chart-radar-view'
import { useChart } from '../useChart'

const dataRequest = vi.hoisted(() => ({
  pending: null as Promise<{ series: Array<{ name: string; type: string; data: Array<{ value: number; name: string }> }> }> | null
}))

vi.mock('../useTimer', () => ({ useTimer: vi.fn() }))
vi.mock('resize-detector', () => ({ addListener: vi.fn(), removeListener: vi.fn() }))
vi.mock('../useTheme', async () => {
  const { computed, ref } = await import('vue')
  return {
    useTheme: (props: { colorGroup?: string[] }) => ({
      colorGroup: computed(() => props.colorGroup || ['#3fb1e3', '#6be6c1']),
      textColorStyle: ref({ color: '#333' }),
      containerBgStyle: ref({ backgroundColor: '#fff' })
    })
  }
})
vi.mock('@supermapgis/common/utils/theme/chart', () => ({
  chartThemeUtil: () => ({}),
  getMultiColorGroup: (colors: unknown[]) => colors,
  handleMultiGradient: (colors: unknown[]) => colors
}))
vi.mock('@supermapgis/iclient-common/util/ColorsPickerUtil', () => ({
  ColorsPickerUtil: { getGradientColors: (colors: unknown[]) => colors }
}))
vi.mock('@supermapgis/iclient-components-core/core/utils/util', () => ({
  getFeatureCenter: vi.fn(),
  setPopupArrowStyle: vi.fn(),
  getColorWithOpacity: (color: unknown) => color,
  getDecimalsFormatterVal: (value: unknown) => value
}))
// 仅隔离数据获取；颜色合并使用真实 useChart，并检查 ECharts 最终绘制。
vi.mock('@supermapgis/iclient-components-core/core/utils/EchartsDataService', () => ({
  default: class {
    constructor(_dataset: unknown, private datasetOptions: Array<{ seriesType?: string; yField?: string }>) {}

    getDataOption() {
      if (dataRequest.pending) {
        const request = dataRequest.pending
        dataRequest.pending = null
        return request
      }
      if (this.datasetOptions?.[0]?.seriesType === 'gauge') {
        return Promise.resolve({
          series: [{
            name: 'gauge',
            type: 'gauge',
            data: [{ value: 42, name: this.datasetOptions[0].yField || 'field' }]
          }]
        })
      }
      return Promise.resolve({
        series: [
          { name: 'first', type: 'radar', data: [{ name: 'first', value: [20, 40, 60] }] },
          { name: 'second', type: 'radar', data: [{ name: 'second', value: [30, 50, 70] }] }
        ],
        radar: { indicator: ['A', 'B', 'C'].map(name => ({ name, max: 100 })) }
      })
    }

    setDatasetOptions(options: Array<{ seriesType?: string; yField?: string }>) {
      this.datasetOptions = options
    }

    formatChartData() {
      return {
        series: [{
          name: 'gauge',
          type: 'gauge',
          data: [{ value: 42, name: this.datasetOptions[0].yField || 'field' }]
        }]
      }
    }
  }
}))

use(radarNodeStyleExtension)
const cleanup: (() => void)[] = []
afterEach(() => cleanup.splice(0).forEach(dispose => dispose()))

async function createChart(colors: unknown[]) {
  const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
  const props = reactive({
    seriesType: 'radar',
    dataset: { type: 'geoJSON', geoJSON: {} },
    datasetOptions: [{ seriesType: 'radar' }],
    options: {
      animation: false,
      color: ['#3fb1e3', '#6be6c1'],
      radar: { indicator: [] },
      series: colors.map(color => ({
        type: 'radar',
        symbol: 'circle',
        itemStyle: { color },
        data: []
      }))
    },
    highlightColor: '#01ffff',
    highlightOptions: [],
    theme: {},
    autoresize: false
  })
  let hook!: ReturnType<typeof useChart>
  const host = document.createElement('div')
  const app = createApp({
    setup() {
      hook = useChart({
        props,
        emit: vi.fn(),
        viewModel: ref({}),
        chartRef: ref({ chart, resize: vi.fn(), hideLoading: vi.fn() }),
        mapNotLoadedTip: () => false
      })
      return () => h('div')
    }
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    chart.dispose()
  })
  await vi.waitFor(() => expect(hook._chartOptions.value.series?.[0]?.data).toHaveLength(1))
  const render = async () => {
    await nextTick()
    chart.setOption(hook._chartOptions.value)
    return chart
      .getZr()
      .storage.getDisplayList(true)
      .filter(element => '__dimIdx' in element)
      .map(element => element.style.fill)
  }
  return { hook, props, render }
}

async function createGaugeChart(
  gaugeVariant: 'base' | 'mark' | 'shine' | 'spin',
  options: Record<string, unknown>,
  thresholdConfig?: { show?: boolean; pieces: Array<{ min: number; max: number; color: string }> },
  onMount?: (props: {
    options: Record<string, unknown>
    dataset: { type: string; geoJSON: Record<string, unknown> }
  }) => void | Promise<void>
) {
  const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 298 })
  const props = reactive({
    seriesType: 'gauge',
    gaugeVariant,
    thresholdConfig,
    dataset: { type: 'geoJSON', geoJSON: {} },
    datasetOptions: [{ seriesType: 'gauge', yField: 'field' }],
    options,
    colorGroup: ['#3fb1e3', '#6be6c1'],
    background: '#fff',
    decimals: -1,
    highlightOptions: [],
    theme: {},
    autoresize: false
  })
  let hook!: ReturnType<typeof useChart>
  const host = document.createElement('div')
  const app = createApp({
    setup() {
      hook = useChart({
        props,
        emit: vi.fn(),
        viewModel: ref({}),
        chartRef: ref({ chart, resize: vi.fn(), hideLoading: vi.fn() }),
        mapNotLoadedTip: () => false
      })
      return () => h('div')
    }
  })
  app.mount(host)
  await onMount?.(props)
  cleanup.push(() => {
    app.unmount()
    chart.dispose()
  })
  await vi.waitFor(() => expect(hook._chartOptions.value.series?.[0]?.data?.[0]?.value).toBe(42))
  chart.setOption(hook._chartOptions.value)
  return { hook, chart, props }
}

describe('bound chart highlight colors', () => {
  it('uses the latest configured gauge title when a pending request resolves', async () => {
    let resolveRequest!: (value: { series: Array<{ name: string; type: string; data: Array<{ value: number; name: string }> }> }) => void
    dataRequest.pending = new Promise(resolve => { resolveRequest = resolve })
    const { hook } = await createGaugeChart('base', {
      series: [{ type: 'gauge', data: [{ value: 1, name: 'before' }] }]
    }, undefined, props => {
      props.options = { series: [{ type: 'gauge', data: [{ value: 1, name: 'latest' }] }] }
      resolveRequest({ series: [{ name: 'gauge', type: 'gauge', data: [{ value: 42, name: 'field' }] }] })
    })
    expect(hook._chartOptions.value.series[0].data[0]).toMatchObject({ value: 42, name: 'latest' })
  })

  it('ignores a stale gauge request after switching datasets', async () => {
    type Response = { series: Array<{ name: string; type: string; data: Array<{ value: number; name: string }> }> }
    let resolveOld!: (value: Response) => void
    let resolveNew!: (value: Response) => void
    dataRequest.pending = new Promise(resolve => { resolveOld = resolve })
    const { hook } = await createGaugeChart('base', {
      series: [{ type: 'gauge', data: [{ value: 1, name: 'configured' }] }]
    }, undefined, async props => {
      dataRequest.pending = new Promise(resolve => { resolveNew = resolve })
      props.dataset = { type: 'geoJSON', geoJSON: { changed: true } }
      await nextTick()
      resolveNew({ series: [{ name: 'gauge', type: 'gauge', data: [{ value: 42, name: 'new' }] }] })
      await nextTick()
      resolveOld({ series: [{ name: 'gauge', type: 'gauge', data: [{ value: 3, name: 'old' }] }] })
      await nextTick()
    })
    expect(hook._chartOptions.value.series[0].data[0]).toMatchObject({ value: 42, name: 'configured' })
  })

  it.each(['base', 'mark', 'shine', 'spin'] as const)(
    'keeps the configured %s gauge title over the data-generated name on updates',
    async gaugeVariant => {
      const auxiliarySeries = gaugeVariant === 'spin'
        ? [{ type: 'pie', radius: ['58%', '45%'], data: [{ value: 1 }, { value: 99 }] }]
        : gaugeVariant === 'base' ? [] : [{ type: 'gauge', min: 0, max: 100 }]
      const { hook, props, chart } = await createGaugeChart(gaugeVariant, {
        series: [{ type: 'gauge', data: [{ value: 1, name: '完成率' }] }, ...auxiliarySeries]
      })
      expect(hook._chartOptions.value.series[0].data[0]).toMatchObject({ value: 42, name: '完成率' })
      const series = props.options.series as Array<{ data: Array<{ name?: string; value: number }> }>
      series[0].data[0].name = 'Custom'
      await nextTick()
      expect(hook._chartOptions.value.series[0].data[0]).toMatchObject({ value: 42, name: 'Custom' })
      if (gaugeVariant === 'base') {
        chart.setOption(hook._chartOptions.value)
        expect(chart.renderToSVGString()).toContain('Custom')
      }
      props.datasetOptions = [{ seriesType: 'gauge', yField: 'other' }]
      await nextTick()
      expect(hook._chartOptions.value.series[0].data[0]).toMatchObject({ value: 42, name: 'Custom' })
      series[0].data[0].name = ''
      await nextTick()
      expect(hook._chartOptions.value.series[0].data[0].name).toBe('')
      delete series[0].data[0].name
      await nextTick()
      expect(hook._chartOptions.value.series[0].data[0].name).toBe('')
      expect(series[0].data[0].value).toBe(1)
    }
  )

  it('preserves unselected series and restores configured solid colors after clearing highlight', async () => {
    const { hook, render } = await createChart(['#7ed321', '#556677'])
    expect(await render()).toEqual([...Array(3).fill('#7ed321'), ...Array(3).fill('#556677')])
    hook.setItemStyleColor(true, undefined, [{ seriesIndex: [0], dataIndex: 0 }])
    expect(await render()).toEqual([...Array(3).fill('#01ffff'), ...Array(3).fill('#556677')])
    hook.setItemStyleColor(true, undefined, [])
    expect(await render()).toEqual([...Array(3).fill('#7ed321'), ...Array(3).fill('#556677')])
  })

  describe('Gauge variant runtime options', () => {
    it('updates rendered Mark scale and progress colors after palette and options change', async () => {
      const { hook, chart, props } = await createGaugeChart('mark', {
        series: [
          {
            type: 'gauge', min: 0, max: 100, data: [{ value: 42 }],
            axisLine: { lineStyle: { color: [[0.42, '#old'], [1, '#old']] } }
          },
          {
            type: 'gauge', min: 0, max: 100,
            axisTick: { lineStyle: { color: '#old' } },
            splitLine: { lineStyle: { color: '#old' } },
            axisLabel: { color: '#333333' }
          }
        ]
      })
      const series = props.options.series as Array<{
        axisLine: { lineStyle: { color: Array<[number, string]> } }
        axisTick: { lineStyle: { color: string } }
        splitLine: { lineStyle: { color: string } }
      }>
      series[0].axisLine.lineStyle.color = [[0.42, '#123456'], [1, '#abcdef']]
      series[1].axisTick.lineStyle.color = '#123456'
      series[1].splitLine.lineStyle.color = '#123456'
      props.colorGroup = ['#123456', '#abcdef']
      await vi.waitFor(() => expect(hook._chartOptions.value.series[1].splitLine.lineStyle.color).toBe('#123456'))
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      const rendered = chart.getOption().series
      expect(rendered[0].axisLine.lineStyle.color).toEqual([[0.42, '#123456'], [1, '#abcdef']])
      expect(rendered[1].axisTick.lineStyle.color).toBe('#123456')
      expect(rendered[1].splitLine.lineStyle.color).toBe('#123456')
      expect(rendered[1].axisLabel.color).toBe('#333333')
      series[1].splitLine.lineStyle.color = '#778899'
      await vi.waitFor(() => expect(hook._chartOptions.value.series[1].splitLine.lineStyle.color).toBe('#778899'))
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      expect(chart.getOption().series[1].splitLine.lineStyle.color).toBe('#778899')
    })

    it('uses the new palette for Spin segments after their explicit colors are cleared', async () => {
      const { hook, chart, props } = await createGaugeChart('spin', {
        series: [
          {
            type: 'gauge', data: [{ value: 42 }],
            customOptions: { color: '#123456' },
            splitLine: { lineStyle: {} }
          },
          {
            type: 'pie', radius: ['58%', '45%'],
            data: [
              { value: 42, itemStyle: { normal: { color: '#ff0000' } } },
              { value: 58, itemStyle: { normal: { color: '#00ff00' } } }
            ]
          }
        ]
      })
      const series = props.options.series as Array<{
        customOptions: { color: string }
        data: Array<{ itemStyle: { normal: { color: string } } }>
      }>
      series[0].customOptions.color = '#123456'
      series[1].data[0].itemStyle.normal.color = ''
      series[1].data[1].itemStyle.normal.color = ''
      props.colorGroup = ['#123456', '#abcdef']
      await vi.waitFor(() => expect(hook._chartOptions.value.series[1].data[0].itemStyle.normal.color).toBe('#123456'))
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      expect(chart.renderToSVGString()).toContain('fill="#123456"')
      expect(chart.renderToSVGString()).toContain('fill="#abcdef"')

      series[1].data[0].itemStyle.normal.color = '#aabbcc'
      await vi.waitFor(() => expect(hook._chartOptions.value.series[1].data[0].itemStyle.normal.color).toBe('#aabbcc'))
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      expect(chart.renderToSVGString()).toContain('fill="#aabbcc"')
    })

    it('updates Shine gradient and scale colors after changing the palette', async () => {
      const { hook, chart, props } = await createGaugeChart('shine', {
        series: [
          { type: 'gauge', data: [{ value: 42 }], axisLine: { lineStyle: { color: [[0.42, '#old'], [1, '#old']] } } },
          { type: 'gauge', axisTick: { lineStyle: {} }, splitLine: { lineStyle: {} } },
          ...[35, 40, 45, 50].map(radius => ({
            type: 'pie', radius: `${radius}%`, data: [{ value: 1 }],
            itemStyle: { normal: { color: { type: 'linear', colorStops: [
              { offset: 0, color: '#old' }, { offset: 1, color: '#old' }
            ] } } }
          }))
        ]
      })
      const series = props.options.series as Array<{
        axisLine: { lineStyle: { color: Array<[number, string]> } }
        axisTick: { lineStyle: { color: string } }
        splitLine: { lineStyle: { color: string } }
      }>
      series[0].axisLine.lineStyle.color = [[0.42, '#123456'], [1, '#abcdef']]
      series[1].axisTick.lineStyle.color = '#123456'
      series[1].splitLine.lineStyle.color = '#123456'
      props.colorGroup = ['#123456', '#abcdef']
      await vi.waitFor(() =>
        expect(hook._chartOptions.value.series[2].itemStyle.normal.color.colorStops[0].color).toBe('#123456')
      )
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      const rendered = chart.getOption().series
      expect(rendered[1].axisTick.lineStyle.color).toBe('#123456')
      expect(rendered[1].splitLine.lineStyle.color).toBe('#123456')
      expect(rendered[2].itemStyle.color.colorStops.map(stop => stop.color)).toEqual(['#123456', '#abcdef'])
      expect(rendered[3].itemStyle.color.colorStops.map(stop => stop.color)).toEqual(['#123456', '#123456'])
    })

    it('applies base gauge pieces regardless of legacy show and restores the default after removal', async () => {
      const { hook, chart, props } = await createGaugeChart('base', {
        series: [{
          type: 'gauge',
          min: -50,
          max: 150,
          data: [{ value: 42 }],
          axisLine: { show: true, lineStyle: { width: 20 } }
        }]
      }, {
        show: false,
        pieces: [{ min: 0, max: 50, color: '#ff0000' }]
      })
      expect(chart.getOption().series[0].axisLine.lineStyle.color).toEqual([
        [0.25, '#3fb1e3'],
        [0.5, '#ff0000'],
        [1, '#6be6c1']
      ])

      props.thresholdConfig!.pieces = []
      await nextTick()
      expect(hook.chartUpdateOptions.value.notMerge).toBe(true)
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      expect(chart.getOption().series[0].axisLine.lineStyle.color).not.toEqual([
        [0.25, '#3fb1e3'],
        [0.5, '#ff0000'],
        [1, '#6be6c1']
      ])

      props.thresholdConfig!.pieces = [{ min: -50, max: 150, color: '#00ff00' }]
      await nextTick()
      chart.setOption(hook._chartOptions.value, hook.chartUpdateOptions.value)
      expect(chart.getOption().series[0].axisLine.lineStyle.color).toEqual([[1, '#00ff00']])
    })

    it('does not apply gauge pieces when the axis line is hidden', async () => {
      const { hook } = await createGaugeChart('base', {
        series: [{
          type: 'gauge',
          min: 0,
          max: 100,
          data: [{ value: 42 }],
          axisLine: { show: false, lineStyle: { width: 20 } }
        }]
      }, {
        show: false,
        pieces: [{ min: 0, max: 100, color: '#ff0000' }]
      })
      expect(hook._chartOptions.value.series[0].axisLine.show).toBe(false)
      expect(hook._chartOptions.value.series[0].axisLine.lineStyle.color).toBeUndefined()
    })

    it('updates Mark value threshold and scale colors in rendered options', async () => {
      const { chart } = await createGaugeChart('mark', {
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            radius: '55%',
            data: [{ value: 36 }],
            axisLine: { lineStyle: { color: [[0.36, ''], [1, '']] } }
          },
          {
            type: 'gauge',
            min: 0,
            max: 100,
            radius: '75%',
            axisTick: { lineStyle: {} },
            splitLine: { lineStyle: {} },
            axisLabel: {}
          }
        ]
      })
      const series = chart.getOption().series
      expect(series[0].data[0].value).toBe(42)
      expect(series[0].axisLine.lineStyle.color).toEqual([
        [0.42, '#3fb1e3'],
        [1, '#6be6c1']
      ])
      expect(series[1].axisTick.lineStyle.color).toBe('#3fb1e3')
      expect(series[1].splitLine.lineStyle.color).toBe('#3fb1e3')
    })

    it('updates Shine decorative gradients from the current palette', async () => {
      const { chart } = await createGaugeChart('shine', {
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            data: [{ value: 80 }],
            axisLine: { lineStyle: { color: [[0.8, ''], [1, '#111F42']] } }
          },
          { type: 'gauge', min: 0, max: 100 },
          ...[35, 40, 45, 50].map(radius => ({
            type: 'pie',
            radius: `${radius}%`,
            data: [{ value: 1 }],
            itemStyle: {
              normal: {
                color: {
                  type: 'linear',
                  colorStops: [{ offset: 0, color: '' }, { offset: 1, color: '' }]
                }
              }
            }
          }))
        ]
      })
      const series = chart.getOption().series
      expect(series[0].axisLine.lineStyle.color[0]).toEqual([0.42, '#3fb1e3'])
      expect(series[2].itemStyle.color.colorStops.map(stop => stop.color))
        .toEqual(['#3fb1e3', '#6be6c1'])
      expect(series[3].itemStyle.color.colorStops.map(stop => stop.color))
        .toEqual(['#3fb1e3', '#3fb1e3'])
    })

    it('synchronizes Spin gauge and pie progress while retaining custom ring settings', async () => {
      const { hook, chart } = await createGaugeChart('spin', {
        series: [
          {
            type: 'gauge',
            min: 0,
            max: 100,
            customType: 'customRingsSeries',
            customOptions: { pointState: 'startPoint', radius: 0.65, color: '' },
            radius: '58%',
            splitLine: { lineStyle: { width: 5 } },
            data: [{ value: 80 }]
          },
          {
            type: 'pie',
            radius: ['58%', '45%'],
            data: [{ value: 80 }, { value: 20 }]
          }
        ]
      })
      const series = chart.getOption().series
      expect(series[0].data[0].value).toBe(42)
      expect(series[0].radius).toBe('58%')
      expect(series[0].splitLine.length).toBe('22%')
      expect(series[0].customOptions.color).toBe('#3fb1e3')
      expect(series[1].data.map(item => item.value)).toEqual([42, 58])
      await vi.waitFor(() => {
        expect(hook._chartOptions.value.series.filter(item => item.type === 'custom')).toHaveLength(6)
      })
      const pointSeries = hook._chartOptions.value.series.find(item => item.name === 'ring4')
      const point = pointSeries.renderItem({}, { getWidth: () => 400, getHeight: () => 298 })
      expect(point.style.stroke).toBe('#3fb1e3')
      expect(point.style.fill).toBe('#3fb1e3')
    })
  })

  it('restores gradient and callback colors through repeated highlights without replacing the source config', async () => {
    const gradient = {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#7ed321' },
        { offset: 1, color: '#556677' }
      ]
    }
    const formatter = vi.fn(() => '#aa33bb')
    const { hook, props, render } = await createChart([gradient, formatter])
    for (let index = 0; index < 2; index++) {
      hook.setItemStyleColor(true, undefined, [{ seriesIndex: [0], dataIndex: 0 }])
      await render()
      hook.setItemStyleColor(true, undefined, [])
      const fills = await render()
      expect(fills.slice(0, 3)).toEqual(Array(3).fill(gradient))
      expect(fills.slice(3)).toEqual(Array(3).fill('#aa33bb'))
    }
    expect(formatter).toHaveBeenCalledWith(
      expect.objectContaining({ seriesIndex: 1, dataIndex: 0 })
    )
    expect(props.options.series[0].itemStyle.color).toEqual(gradient)
    expect(props.options.series[1].itemStyle.color).toBe(formatter)
  })

  it('keeps palette fallback for nodes without an explicit color', async () => {
    const { hook, render } = await createChart([undefined, ''])
    hook.setItemStyleColor(true, undefined, [{ seriesIndex: [0], dataIndex: 0 }])
    await render()
    hook.setItemStyleColor(true, undefined, [])
    expect(await render()).toEqual([...Array(3).fill('#3fb1e3'), ...Array(3).fill('#6be6c1')])
  })
})
