import { describe, expect, it, vi } from 'vitest'
import { init } from 'echarts'
import { withRadarTooltipDimensions } from '../chart-tooltip'

describe('radar tooltip dimensions', () => {
  it('provides rendered indicator names to real ECharts formatter callbacks', () => {
    const formatter = vi.fn((params: { dimensionNames: string[]; value: number[] }) =>
      params.dimensionNames.map((name, index) => `${name}: ${params.value[index]}`).join('\n')
    )
    const input = {
      animation: false,
      tooltip: { formatter },
      radar: { indicator: [{ name: '12时', max: 200 }, { name: '13时', max: 200 }] },
      series: [{ type: 'radar', name: '金沙江', data: [{ name: '金沙江', value: [100, 130] }] }]
    }
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
    try {
      chart.setOption(withRadarTooltipDimensions(input))
      const params = chart.getModel().getSeriesByIndex(0).getDataParams(0)
      const originalDimensions = [...params.dimensionNames]
      const renderedFormatter = chart.getOption().tooltip[0].formatter
      expect(renderedFormatter(params)).toBe('12时: 100\n13时: 130')
      expect(params.dimensionNames).toEqual(originalDimensions)
      expect(input.tooltip.formatter).toBe(formatter)
    } finally {
      chart.dispose()
    }
  })

  it('keeps duplicate labels, radar selection and the async callback arguments', () => {
    const formatter = vi.fn()
    const options = withRadarTooltipDimensions({
      radar: [{ indicator: [{ name: 'other' }] }, { indicator: [{ name: 'A' }, { text: 'A' }] }],
      series: [{ type: 'radar', radarIndex: 1 }],
      tooltip: { formatter }
    })
    const callback = vi.fn()
    const context = {}
    options.tooltip.formatter.call(context, [{ seriesIndex: 0, value: [10, 20] }], 'ticket', callback)
    expect(formatter).toHaveBeenCalledWith([
      { seriesIndex: 0, value: [10, 20], dimensionNames: ['A', 'A'] }
    ], 'ticket', callback)
    expect(formatter.mock.contexts[0]).toBe(context)
  })

  it.each(['pie', 'ring', 'bar', 'horizontalBar', 'line', 'scatter'])(
    'preserves native %s callback parameters when radar coordinates are configured',
    kind => {
      const formatter = vi.fn<(params: unknown) => string>(() => 'tooltip')
      const pieLike = kind === 'pie' || kind === 'ring'
      const input = {
        animation: false,
        tooltip: { formatter },
        radar: { indicator: ['A', 'B', 'C'].map(name => ({ name, max: 100 })) },
        ...(!pieLike ? {
          xAxis: kind === 'horizontalBar' ? {} : { type: 'category', data: ['A', 'B'] },
          yAxis: kind === 'horizontalBar' ? { type: 'category', data: ['A', 'B'] } : {}
        } : {}),
        series: [{
          type: pieLike ? 'pie' : kind === 'horizontalBar' ? 'bar' : kind,
          radius: kind === 'ring' ? ['30%', '50%'] : '50%',
          data: pieLike ? [{ name: 'one', value: 10 }, { name: 'two', value: 20 }] : [10, 20]
        }]
      }
      const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
      try {
        chart.setOption(withRadarTooltipDimensions(input))
        const params = chart.getModel().getSeriesByIndex(0).getDataParams(0)
        const originalDimensions = [...params.dimensionNames]
        const renderedFormatter = chart.getOption().tooltip[0].formatter
        expect(renderedFormatter(params)).toBe('tooltip')
        expect(formatter.mock.calls[0][0]).toBe(params)
        expect(params.dimensionNames).toEqual(originalDimensions)
        const paramsList = [params]
        renderedFormatter(paramsList)
        expect(formatter.mock.calls[1][0]).toBe(paramsList)
      } finally {
        chart.dispose()
      }
    }
  )

  it('adds dimensions only to radar callbacks in a mixed pie and ring chart', () => {
    const formatter = vi.fn<(params: unknown) => string>(() => 'tooltip')
    const input = {
      animation: false,
      tooltip: { formatter },
      radar: { indicator: ['A', 'B', 'C'].map(name => ({ name, max: 100 })) },
      series: [
        { type: 'radar', data: [{ name: 'radar', value: [20, 40, 60] }] },
        { type: 'pie', radius: '30%', data: [{ name: 'pie', value: 10 }] },
        { type: 'pie', radius: ['40%', '50%'], data: [{ name: 'ring', value: 20 }] }
      ]
    }
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
    try {
      chart.setOption(withRadarTooltipDimensions(input))
      const original = input.series.map((_, index) =>
        chart.getModel().getSeriesByIndex(index).getDataParams(0)
      )
      chart.getOption().tooltip[0].formatter(original)
      const received = formatter.mock.calls[0][0] as typeof original
      expect(received[0].dimensionNames).toEqual(['A', 'B', 'C'])
      expect(received[1]).toBe(original[1])
      expect(received[2]).toBe(original[2])
      expect(original.map(params => params.dimensionNames)).toEqual([[], [], []])
    } finally {
      chart.dispose()
    }
  })

  it('preserves native templates and ordinary chart options', () => {
    const radar = { radar: {}, tooltip: { formatter: '{a}: {c}' } }
    const line = { tooltip: { formatter: vi.fn() } }
    expect(withRadarTooltipDimensions(radar)).toBe(radar)
    expect(withRadarTooltipDimensions(line)).toBe(line)
  })
})
