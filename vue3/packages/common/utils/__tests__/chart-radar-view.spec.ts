import { describe, expect, it } from 'vitest'
import { init, use, type ECharts, type graphic } from 'echarts'
import { radarNodeStyleExtension } from '../chart-radar-view'

use(radarNodeStyleExtension)

function getNodeStyles(chart: ECharts) {
  const styles: { stroke: unknown; fill: unknown; lineWidth?: number }[] = []
  chart
    .getZr()
    .storage.getDisplayList(true)
    .forEach(element => {
      const symbol = element as InstanceType<typeof graphic.Circle> & { __dimIdx?: number }
      if (symbol.__dimIdx !== undefined) {
        styles.push({
          stroke: symbol.style.stroke,
          fill: symbol.style.fill,
          lineWidth: symbol.style.lineWidth
        })
      }
    })
  return styles
}

describe('radar node rendering', () => {
  it('honors hollow node borders while retaining the series and legend color', () => {
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
    try {
      chart.setOption({
        animation: false,
        color: ['#3fb1e3'],
        legend: { show: true },
        radar: { indicator: ['A', 'B', 'C'].map(name => ({ name, max: 100 })) },
        series: [
          {
            type: 'radar',
            symbol: 'emptyCircle',
            name: 'Y1',
            itemStyle: { borderWidth: 6, borderColor: '#bd10e0' },
            data: [{ name: 'Y1', value: [20, 40, 60] }]
          }
        ]
      })
      expect(getNodeStyles(chart)).toHaveLength(3)
      for (const node of getNodeStyles(chart)) {
        expect(node.stroke).toBe('#bd10e0')
        expect(node.lineWidth).toBe(6)
        expect(node.fill).not.toBe('#3fb1e3')
      }
      expect(chart.getVisual({ seriesIndex: 0, dataIndex: 0 }, 'color')).toBe('#3fb1e3')
      const svg = new DOMParser().parseFromString(chart.renderToSVGString(), 'image/svg+xml')
      expect(svg.querySelector('path[fill="#3fb1e3"]')).not.toBeNull()

      chart.setOption({ series: [{ symbol: 'circle' }] })
      expect(
        getNodeStyles(chart).every(node => node.fill === '#3fb1e3' && node.lineWidth === 6)
      ).toBe(true)
      chart.setOption({
        series: [{ symbol: 'emptyCircle', itemStyle: { borderWidth: 0, borderColor: '' } }]
      })
      expect(
        getNodeStyles(chart).every(node => node.stroke === '#3fb1e3' && node.lineWidth === 0)
      ).toBe(true)
    } finally {
      chart.dispose()
    }
  })

  it.each(['line', 'scatter'] as const)('preserves native %s node rendering', type => {
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
    try {
      chart.setOption({
        animation: false,
        color: ['#3fb1e3'],
        xAxis: { type: 'category', data: ['A', 'B', 'C'] },
        yAxis: {},
        series: [
          {
            type,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: { borderWidth: 4, borderColor: '#bd10e0' },
            data: [20, 40, 60]
          }
        ]
      })
      const nodes = chart.getZr().storage.getDisplayList(true).filter(element => {
        const style = (element as InstanceType<typeof graphic.Circle>).style
        return style.fill === '#3fb1e3' && style.stroke === '#bd10e0' && style.lineWidth === 4
      })
      expect(nodes).toHaveLength(3)
    } finally {
      chart.dispose()
    }
  })
})
