import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive, ref } from 'vue'
import { init, use } from 'echarts'
import { radarNodeStyleExtension } from '../../utils/chart-radar-view'
import { useChart } from '../useChart'

vi.mock('../useTimer', () => ({ useTimer: vi.fn() }))
vi.mock('resize-detector', () => ({ addListener: vi.fn(), removeListener: vi.fn() }))
vi.mock('../useTheme', async () => {
  const { ref } = await import('vue')
  return {
    useTheme: () => ({
      colorGroup: ref(['#3fb1e3', '#6be6c1']),
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
    getDataOption() {
      return Promise.resolve({
        series: [
          { name: 'first', type: 'radar', data: [{ name: 'first', value: [20, 40, 60] }] },
          { name: 'second', type: 'radar', data: [{ name: 'second', value: [30, 50, 70] }] }
        ],
        radar: { indicator: ['A', 'B', 'C'].map(name => ({ name, max: 100 })) }
      })
    }
  }
}))

use(radarNodeStyleExtension)
const cleanup: (() => void)[] = []
afterEach(() => cleanup.splice(0).forEach(dispose => dispose()))

async function createChart(colors: unknown[]) {
  const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
  const props = reactive({
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

describe('bound chart highlight colors', () => {
  it('preserves unselected series and restores configured solid colors after clearing highlight', async () => {
    const { hook, render } = await createChart(['#7ed321', '#556677'])
    expect(await render()).toEqual([...Array(3).fill('#7ed321'), ...Array(3).fill('#556677')])
    hook.setItemStyleColor(true, undefined, [{ seriesIndex: [0], dataIndex: 0 }])
    expect(await render()).toEqual([...Array(3).fill('#01ffff'), ...Array(3).fill('#556677')])
    hook.setItemStyleColor(true, undefined, [])
    expect(await render()).toEqual([...Array(3).fill('#7ed321'), ...Array(3).fill('#556677')])
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
