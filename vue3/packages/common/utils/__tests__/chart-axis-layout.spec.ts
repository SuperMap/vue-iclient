import { describe, expect, it, vi } from 'vitest'
import { init } from 'echarts'
import { fitChartAxisLayout } from '../chart-axis-layout'

/**
 * containLabel 只负责刻度标签，它既不包含轴名，也不保证窄容器里还剩得下绘图区。
 * 值轴带单位（轴名）时轴名画在 grid 之外，会被容器边缘裁掉；类目标签过长时柱子被压没。
 * 这里守的是四个方向统一预算，并且每次都从原始 options 重算（幂等）。
 */
describe('chart axis layout budget', () => {
  const size = { width: 200, height: 200 }

  it('reserves a plot area and restores category label width after resizing', () => {
    const options = { grid: { left: 16, right: 24, containLabel: true },
      yAxis: [{ type: 'category', axisLabel: { width: 240, overflow: 'truncate' } }] }
    const small = fitChartAxisLayout(options, size)
    expect(small.yAxis[0].axisLabel.width).toBe(64)
    expect(small.grid.left).toBe(16)
    expect(options.yAxis[0].axisLabel.width).toBe(240)
    expect(fitChartAxisLayout(options, { width: 800, height: 400 })).toBe(options)
    // 幂等：同一尺寸重算不再收窄，容器放大后也不会残留上次的限宽。
    expect(fitChartAxisLayout(small, size)).toBe(small)
  })

  it('reserves room for a value-axis unit name above the grid', () => {
    const options = { grid: { left: 32, right: 20, top: 35, bottom: 35, containLabel: true },
      xAxis: [{ type: 'category' }], yAxis: [{ type: 'value', name: '万千瓦时' }] }
    const fitted = fitChartAxisLayout(options, size)
    // y 轴名默认画在 grid 上方，必须补出 grid.top，否则单位被容器上沿裁掉。
    expect(fitted.grid.top).toBeGreaterThan(35)
    expect(fitted.grid.left).toBe(32)
  })

  it('puts a centered y-axis name on the left and a centered x-axis name below', () => {
    const fitted = fitChartAxisLayout({ grid: { left: 10, bottom: 10 },
      xAxis: [{ type: 'category', name: '年份', nameLocation: 'middle' }],
      yAxis: [{ type: 'value', name: '万千瓦时', nameLocation: 'middle' }] }, size)
    expect(fitted.grid.left).toBeGreaterThan(10)
    expect(fitted.grid.bottom).toBeGreaterThan(10)
  })

  it('never lets the axis name squeeze the plot below the minimum', () => {
    const options = { grid: { left: 60, right: 60, containLabel: true },
      yAxis: [{ type: 'value', name: '万千瓦时', nameLocation: 'middle' }] }
    const fitted = fitChartAxisLayout(options, { width: 220, height: 200 })
    const left = typeof fitted.grid.left === 'number' ? fitted.grid.left : 60
    const right = typeof fitted.grid.right === 'number' ? fitted.grid.right : 60
    expect(220 - left - right).toBeGreaterThanOrEqual(96)
  })

  it('leaves charts without axis names and without truncation untouched', () => {
    const options = { grid: { left: 16 }, xAxis: [{ type: 'category' }], yAxis: [{ type: 'value' }] }
    expect(fitChartAxisLayout(options, size)).toBe(options)
    expect(fitChartAxisLayout(options, {})).toBe(options)
  })
})

// 预算是否真的够用只能由真实排版回答：用 ECharts 的 SSR 渲染器实跑一遍。
describe('chart axis layout in the real ECharts renderer', () => {
  const mockMeasure = () => vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    measureText: (text: string) => ({ width: text.length * 12 })
  } as never)

  it('keeps a usable plot with long labels', () => {
    const getContext = mockMeasure()
    const input = { animation: false, grid: { left: 16, right: 24, top: 16, bottom: 24, containLabel: true },
      xAxis: { type: 'value' }, yAxis: [{ type: 'category', data: ['四川省某流域大型水电站发电总量', '第二座水电站'],
        axisLabel: { width: 240, overflow: 'truncate', align: 'right' } }], series: [{ type: 'bar', data: [70, 50] }] }
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 240, height: 200 })
    try {
      chart.setOption(fitChartAxisLayout(input, { width: 240, height: 200 }))
      expect((chart as any).getModel().getComponent('grid').coordinateSystem.getRect().width).toBeGreaterThan(100)
      expect(chart.renderToSVGString()).toContain('...')
    } finally {
      chart.dispose()
      getContext.mockRestore()
    }
  })

  it('renders the value-axis unit inside the canvas instead of clipping it', () => {
    const getContext = mockMeasure()
    const input = { animation: false, grid: { left: 32, right: 20, top: 12, bottom: 35, containLabel: true },
      xAxis: [{ type: 'category', data: ['甲', '乙'] }],
      yAxis: [{ type: 'value', name: '万千瓦时', nameTextStyle: { padding: [0, 0, 5, 0] } }],
      series: [{ type: 'bar', data: [70, 50] }] }
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 320, height: 200 })
    try {
      chart.setOption(fitChartAxisLayout(input, { width: 320, height: 200 }))
      const rect = (chart as any).getModel().getComponent('grid').coordinateSystem.getRect()
      expect(rect.height).toBeGreaterThanOrEqual(96)
      // 轴名在 grid 上方且完整落在画布内，不被容器上沿裁掉。
      expect(rect.y).toBeGreaterThan(12)
      expect(chart.renderToSVGString()).toContain('万千瓦时')
    } finally {
      chart.dispose()
      getContext.mockRestore()
    }
  })
})
