import { cloneDeep } from 'lodash-es'
import {
  shouldTransformArabicNumbers,
  toArabicNumber
} from './arabic-number'

type AnyRecord = Record<string, any>

function formatDisplayText(value: unknown): string {
  if (value == null) {
    return ''
  }
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : String(value)
  return shouldTransformArabicNumbers() ? toArabicNumber(text) : text
}

function formatMaybeRichResult(result: unknown): unknown {
  if (typeof result === 'string' || typeof result === 'number') {
    return formatDisplayText(result)
  }
  return result
}

/**
 * 将已有 formatter（函数 / 模板字符串）包一层，仅改展示文本中的数字字形。
 * axis 场景下无 formatter 时补一个默认转换。
 */
export function wrapChartFormatter(
  formatter: unknown,
  options: { axis?: boolean; tooltipValue?: boolean } = {}
) {
  const { axis = false, tooltipValue = false } = options

  if (typeof formatter === 'function') {
    return (...args: any[]) => formatMaybeRichResult((formatter as (...a: any[]) => unknown)(...args))
  }

  if (typeof formatter === 'string') {
    if (axis || tooltipValue) {
      return (value: unknown) => formatDisplayText(formatter.replace(/\{value\}/g, String(value ?? '')))
    }
    // series / tooltip 模板：先按常见占位符展开，再转阿拉伯数字
    return (params: any) => {
      const list = Array.isArray(params) ? params : [params]
      const first = list[0] || {}
      const value = Array.isArray(first.value) ? first.value.join(', ') : (first.value ?? first.data ?? '')
      const mapped = formatter
        .replace(/\{a\}/g, String(first.seriesName ?? ''))
        .replace(/\{b\}/g, String(first.name ?? ''))
        .replace(/\{c\}/g, String(value ?? ''))
        .replace(/\{d\}/g, String(first.percent ?? ''))
        .replace(/\{e\}/g, String(first.dataIndex ?? ''))
      return formatDisplayText(mapped)
    }
  }

  if (axis || tooltipValue) {
    return (value: unknown) => formatDisplayText(value)
  }

  return formatter
}

function ensureAxisArabicDigits(axis: unknown) {
  if (!axis) {
    return axis
  }
  const axes = Array.isArray(axis) ? axis : [axis]
  axes.forEach((item: AnyRecord) => {
    if (!item || typeof item !== 'object') {
      return
    }
    item.axisLabel = item.axisLabel || {}
    item.axisLabel.formatter = wrapChartFormatter(item.axisLabel.formatter, { axis: true })
    if (item.name != null && typeof item.name === 'string') {
      item.name = formatDisplayText(item.name)
    }
  })
  return Array.isArray(axis) ? axes : axes[0]
}

function ensureSeriesArabicDigits(series: unknown) {
  if (!Array.isArray(series)) {
    return series
  }
  series.forEach((serie: AnyRecord) => {
    if (!serie || typeof serie !== 'object') {
      return
    }
    const wrapLabel = (label: AnyRecord | undefined) => {
      if (!label || typeof label !== 'object') {
        return
      }
      // 仅包装已有 formatter，避免改变各图类默认 label 内容
      if (label.formatter != null) {
        label.formatter = wrapChartFormatter(label.formatter)
      }
    }
    wrapLabel(serie.label?.normal)
    wrapLabel(serie.label)
    wrapLabel(serie.endLabel)
  })
  return series
}

function ensureTooltipArabicDigits(tooltip: unknown) {
  if (!tooltip || typeof tooltip !== 'object') {
    return tooltip
  }
  const tip = tooltip as AnyRecord
  if (tip.formatter != null) {
    tip.formatter = wrapChartFormatter(tip.formatter)
  }
  tip.valueFormatter = wrapChartFormatter(tip.valueFormatter, { tooltipValue: true })
  return tip
}

function wrapLegendPageFormatter(pageFormatter: unknown) {
  if (typeof pageFormatter === 'function') {
    return (params: { current: number; total: number }) =>
      formatDisplayText((pageFormatter as (p: { current: number; total: number }) => string)(params))
  }
  if (typeof pageFormatter === 'string') {
    return (params: { current: number; total: number }) =>
      formatDisplayText(
        pageFormatter
          .replace('{current}', String(params?.current ?? ''))
          .replace('{total}', String(params?.total ?? ''))
      )
  }
  // ECharts 默认 '{current}/{total}'
  return (params: { current: number; total: number }) =>
    formatDisplayText(`${params?.current ?? ''}/${params?.total ?? ''}`)
}

function ensureLegendArabicDigits(legend: unknown) {
  if (!legend) {
    return legend
  }
  const legends = Array.isArray(legend) ? legend : [legend]
  legends.forEach((item: AnyRecord) => {
    if (!item || typeof item !== 'object') {
      return
    }
    // 只改展示，不改 legend.data / series name，避免图例选中匹配失效
    item.formatter = wrapChartFormatter(item.formatter ?? ((name: string) => name))
    // scroll 图例分页文案（如 1/3）；非 scroll 时该字段无效果
    item.pageFormatter = wrapLegendPageFormatter(item.pageFormatter)
  })
  return Array.isArray(legend) ? legends : legends[0]
}

function ensureRadarArabicDigits(radar: unknown) {
  if (!radar || typeof radar !== 'object') {
    return radar
  }
  const radarOption = radar as AnyRecord
  const indicators = radarOption.indicator
  if (Array.isArray(indicators)) {
    radarOption.indicator = indicators.map((item: AnyRecord) => {
      if (!item || typeof item !== 'object') {
        return item
      }
      const next = { ...item }
      if (next.name != null) {
        next.name = formatDisplayText(next.name)
      }
      if (next.text != null) {
        next.text = formatDisplayText(next.text)
      }
      return next
    })
  } else if (indicators && typeof indicators === 'object') {
    Object.keys(indicators).forEach((key) => {
      const item = indicators[key]
      if (item && typeof item === 'object') {
        if (item.name != null) {
          item.name = formatDisplayText(item.name)
        }
        if (item.text != null) {
          item.text = formatDisplayText(item.text)
        }
      }
    })
  }
  if (radarOption.axisName?.formatter != null) {
    radarOption.axisName.formatter = wrapChartFormatter(radarOption.axisName.formatter)
  }
  return radarOption
}

function ensureDataZoomArabicDigits(dataZoom: unknown) {
  if (!dataZoom) {
    return dataZoom
  }
  const list = Array.isArray(dataZoom) ? dataZoom : [dataZoom]
  list.forEach((item: AnyRecord) => {
    if (!item || typeof item !== 'object') {
      return
    }
    if (item.labelFormatter != null || item.type === 'slider') {
      item.labelFormatter = wrapChartFormatter(item.labelFormatter ?? ((value: unknown) => value), {
        axis: true
      })
    }
  })
  return Array.isArray(dataZoom) ? list : list[0]
}

/**
 * 在 ECharts option 展示层统一转换数字字形（RTL 下拉丁 → 阿拉伯）。
 * 不修改业务数据值，仅包装 formatter / 展示文案。
 */
export function applyArabicDigitsToChartOptions<T extends AnyRecord | null | undefined>(options: T): T {
  if (!options || typeof options !== 'object') {
    return options
  }
  if (!shouldTransformArabicNumbers()) {
    return options
  }

  const next = cloneDeep(options) as AnyRecord
  next.xAxis = ensureAxisArabicDigits(next.xAxis)
  next.yAxis = ensureAxisArabicDigits(next.yAxis)
  next.series = ensureSeriesArabicDigits(next.series)
  next.tooltip = ensureTooltipArabicDigits(next.tooltip)
  next.legend = ensureLegendArabicDigits(next.legend)
  next.radar = ensureRadarArabicDigits(next.radar)
  next.dataZoom = ensureDataZoomArabicDigits(next.dataZoom)
  return next as T
}
