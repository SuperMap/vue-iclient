import { describe, expect, it, vi } from 'vitest'
import { init } from 'echarts'
import EchartsDataService from '@supermapgis/iclient-components-core/core/utils/EchartsDataService'

vi.mock('@supermapgis/iclient-components-core/core/utils/get-features', () => ({ default: vi.fn() }))

describe('radar data loading', () => {
  it('renders empty, populated and cleared data without polygons that have no indicators', () => {
    const datasetOptions = [{ xField: 'date', yField: 'level', seriesType: 'radar', sort: 'unsort' }]
    const service = new EchartsDataService({ type: 'geoJSON', maxFeatures: 20 }, datasetOptions)
    const chart = init(null, undefined, { renderer: 'svg', ssr: true, width: 400, height: 288 })
    const format = (features: { properties: { date: string; level: number } }[]) =>
      service.formatChartData(datasetOptions, false, { features })
    try {
      const empty = format([])
      expect(empty.series[0].data).toEqual([])
      expect(() => chart.setOption({ radar: { indicator: [] }, ...empty })).not.toThrow()

      const populated = format(
        [0, 10, 20].map((level, index) => ({ properties: { date: `day ${index}`, level } }))
      )
      expect(populated.series[0].data[0].value).toEqual([0, 10, 20])
      expect(() => chart.setOption(populated)).not.toThrow()
      expect(() => chart.setOption(format([]))).not.toThrow()
      expect(chart.getOption().series[0].data).toEqual([])
    } finally {
      chart.dispose()
    }
  })
})
