import { describe, expect, it, vi } from 'vitest'
import { init, type ECharts } from 'echarts'

vi.mock('@supermapgis/iclient-components-core/core/utils/util', () => ({
  getColorWithOpacity: (color: string) => color
}))

vi.mock('@supermapgis/iclient-common/util/ColorsPickerUtil', () => ({
  ColorsPickerUtil: {
    getGradientColors: (colors: string[]) => colors
  }
}))

import { chartThemeUtil } from '../theme/chart'

function getLegendText(chart: ECharts) {
  const svg = new DOMParser().parseFromString(chart.renderToSVGString(), 'image/svg+xml')
  return [...svg.querySelectorAll('text')].find(element => element.textContent === 'Y1')
}

function createRadarOptions() {
  return {
    animation: false,
    legend: { show: true, textStyle: { color: undefined, fontSize: undefined } },
    radar: { indicator: ['A', 'B', 'C'].map(name => ({ name, max: 100 })) },
    series: [{ type: 'radar' as const, name: 'Y1', data: [{ name: 'Y1', value: [20, 40, 60] }] }]
  }
}

describe('chartThemeUtil', () => {
  it('keeps radar series colors on the chart palette', () => {
    const colorGroup = ['#3fb1e3', '#6be6c1']
    const theme = chartThemeUtil('#fff', '#333', colorGroup, colorGroup.length)

    expect(theme.color).toEqual(colorGroup)
    expect(theme.radar.lineStyle).toEqual({ width: '3' })
  })

  it('renders legend text with the theme color when settings have no explicit color', () => {
    const chart = init(null, chartThemeUtil('#fff', '#123456', ['#3fb1e3'], 1), {
      renderer: 'svg', ssr: true, width: 400, height: 288
    })
    try {
      chart.setOption(createRadarOptions())
      expect(getLegendText(chart)?.getAttribute('fill')).toBe('#123456')
    } finally {
      chart.dispose()
    }
  })

  it('restores the theme color after clearing a custom legend style', () => {
    const chart = init(null, chartThemeUtil('#fff', '#123456', ['#3fb1e3'], 1), {
      renderer: 'svg', ssr: true, width: 400, height: 288
    })
    try {
      chart.setOption(createRadarOptions())
      chart.setOption({ legend: { textStyle: { color: '#cc3366', fontSize: 18 } } })
      expect(getLegendText(chart)?.getAttribute('fill')).toBe('#cc3366')
      expect(getLegendText(chart)?.style.fontSize).toBe('18px')

      chart.setOption({ legend: { textStyle: { color: '', fontSize: undefined } } })
      expect(getLegendText(chart)?.getAttribute('fill')).toBe('#123456')
      expect(getLegendText(chart)?.style.fontSize).toBe('12px')
    } finally {
      chart.dispose()
    }
  })
})
