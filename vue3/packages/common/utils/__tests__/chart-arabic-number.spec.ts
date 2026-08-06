import { beforeEach, describe, expect, it } from 'vitest'
import {
  applyArabicDigitsToChartOptions,
  wrapChartFormatter
} from '../chart-arabic-number'

describe('chart arabic number', () => {
  beforeEach(() => {
    document.documentElement.setAttribute('dir', 'ltr')
  })

  it('does not change options in ltr', () => {
    const options = {
      yAxis: [{ axisLabel: {} }],
      series: [{ type: 'bar', data: [1, 2] }]
    }
    const next = applyArabicDigitsToChartOptions(options)
    expect(next).toBe(options)
  })

  it('wraps axis formatter to arabic digits in rtl', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const options = {
      yAxis: [{ axisLabel: {} }],
      xAxis: [{ axisLabel: { formatter: '{value}' } }],
      series: [{ type: 'bar', label: { formatter: '{c}' }, data: [10] }],
      legend: { show: true },
      tooltip: {}
    }
    const next = applyArabicDigitsToChartOptions(options)
    expect(next).not.toBe(options)
    expect(typeof next.yAxis[0].axisLabel.formatter).toBe('function')
    expect(next.yAxis[0].axisLabel.formatter(10)).toBe('١٠')
    expect(next.xAxis[0].axisLabel.formatter(12)).toBe('١٢')
    expect(next.series[0].label.formatter({ value: 10 })).toBe('١٠')
    expect(next.legend.formatter('站1')).toBe('站١')
    expect(next.tooltip.valueFormatter(20)).toBe('٢٠')
  })

  it('wraps legend pageFormatter for scroll pagination text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const options = {
      legend: { type: 'scroll', show: true },
      series: [{ type: 'pie', data: [] }]
    }
    const next = applyArabicDigitsToChartOptions(options)
    expect(typeof next.legend.pageFormatter).toBe('function')
    expect(next.legend.pageFormatter({ current: 1, total: 3 })).toBe('١/٣')
  })
})
