interface RadarIndicator {
  name?: unknown
  text?: unknown
}

interface RadarOptions {
  indicator?: RadarIndicator[] | Record<string, RadarIndicator>
}

interface ChartOptions {
  radar?: RadarOptions | RadarOptions[]
  series?: { type?: string; radarIndex?: number }[]
  tooltip?: { formatter?: unknown }
}

interface TooltipParams {
  seriesIndex?: number
  seriesType?: string
  dimensionNames?: string[]
}

export function withRadarTooltipDimensions<T extends ChartOptions>(options: T): T {
  const formatter = options?.tooltip?.formatter
  if (!options?.radar || typeof formatter !== 'function') {
    return options
  }
  const radars = Array.isArray(options.radar) ? options.radar : [options.radar]
  const withDimensions = (param: TooltipParams) => {
    if (!param || param.dimensionNames?.length) {
      return param
    }
    const series = options.series?.[param.seriesIndex ?? 0]
    // 混合图表共享 formatter，非雷达系列应保留自身的维度及回调参数。
    if ((param.seriesType ?? series?.type) !== 'radar') {
      return param
    }
    const radarIndex = series?.radarIndex ?? 0
    const indicator = radars[radarIndex]?.indicator ?? []
    // ECharts 的雷达回调缺少维度名；使用最终坐标系，保持数据排序和统计后的标签一致。
    const dimensionNames = Object.values(indicator).map(item => String(item.text ?? item.name ?? ''))
    return { ...param, dimensionNames }
  }
  return {
    ...options,
    tooltip: {
      ...options.tooltip,
      formatter(this: unknown, params: TooltipParams | TooltipParams[], ...args: unknown[]) {
        let nextParams = params
        if (Array.isArray(params)) {
          const mapped = params.map(withDimensions)
          if (mapped.some((param, index) => param !== params[index])) {
            nextParams = mapped
          }
        } else {
          nextParams = withDimensions(params)
        }
        return formatter.call(this, nextParams, ...args)
      }
    }
  }
}
