/**
 * 图表坐标轴的绘图区预算。
 *
 * `containLabel: true` 只保证 ECharts 尝试把**刻度标签**包进 grid，它不包含轴名，
 * 也不保证窄容器里还剩得下绘图区。于是两类问题一直存在：
 * 1. 值轴带单位（轴名）时，轴名画在 grid 之外，被容器边缘裁掉；
 * 2. 类目标签很长时，标签吃掉整个宽度，柱子被压成几像素。
 *
 * 这里在 ECharts 布局之前统一处理四个方向：类目轴按当前容器给标签一个宽度预算，
 * 值轴按轴名的实际位置补出 grid 外留白，并始终为绘图区保留一个下限。
 *
 * 纯函数：每次都从传入的 options 重算，容器缩小再放大不会累积历史限宽（幂等）。
 */

type AxisRecord = Record<string, any>

export type AxisTextMeasure = (text: string, fontSize: number) => number

/** 绘图区的最小可用尺寸；低于它时先削标签预算，而不是继续压缩绘图区。 */
const MIN_PLOT_SIZE = 96
const DEFAULT_FONT_SIZE = 12
/** 类目标签最多占用主轴方向的比例，其余留给数据本身。 */
const CATEGORY_LABEL_BUDGET_RATIO = 0.4

// 无 DOM 时按字宽估算：全角字符按一个字号宽，半角按 0.55。
// 这只用于轴名留白这类小量预算，真正的标签排版仍由 ECharts 完成。
function estimateTextWidth(text: string, fontSize: number) {
  let width = 0
  for (const char of text) {
    width += /[\u2E80-\uFFFD]/.test(char) ? fontSize : fontSize * 0.55
  }
  return width
}

// 度量上下文复用一份，逐次 measure 不再新建 canvas；拿不到就退回估算。
let measureContext: CanvasRenderingContext2D | null | undefined

function getMeasureContext() {
  if (measureContext !== undefined) return measureContext
  try {
    measureContext = typeof document === 'undefined'
      ? null
      : document.createElement('canvas').getContext('2d')
  } catch {
    // 测量只是预算的输入，拿不到画布不能让整张图表渲染失败。
    measureContext = null
  }
  return measureContext
}

export const measureAxisText: AxisTextMeasure = (text, fontSize) => {
  if (!text) return 0
  const context = getMeasureContext()
  if (!context) return estimateTextWidth(text, fontSize)
  try {
    context.font = `${fontSize}px sans-serif`
    const measured = context.measureText(text).width
    return Number.isFinite(measured) && measured > 0 ? measured : estimateTextWidth(text, fontSize)
  } catch {
    return estimateTextWidth(text, fontSize)
  }
}

function toPixels(value: unknown, extent: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.endsWith('%')) {
    const percent = parseFloat(value)
    return Number.isFinite(percent) ? percent * extent / 100 : 0
  }
  return 0
}

function toAxisList(axis: unknown): AxisRecord[] {
  if (Array.isArray(axis)) return axis.filter(item => item && typeof item === 'object')
  return axis && typeof axis === 'object' ? [axis as AxisRecord] : []
}

function fontSizeOf(style: unknown) {
  const size = (style as AxisRecord)?.fontSize
  return typeof size === 'number' && size > 0 ? size : DEFAULT_FONT_SIZE
}

/**
 * 轴名占用的是哪一侧的 grid 外留白。
 *
 * ECharts 默认 `nameLocation:'end'`：y 轴名画在 grid 上方，x 轴名画在 grid 右侧。
 * 写成 'middle'/'center' 时轴名贴着轴居中，y 轴占左侧宽度、x 轴占下方高度。
 * 这条映射是 ECharts 的布局规则，不是某个图表的特例。
 */
function axisNameSide(orientation: 'x' | 'y', nameLocation: unknown): 'top' | 'right' | 'left' | 'bottom' {
  const centered = nameLocation === 'middle' || nameLocation === 'center'
  if (orientation === 'y') return centered ? 'left' : 'top'
  return centered ? 'bottom' : 'right'
}

type Margins = { left: number; right: number; top: number; bottom: number }

function collectAxisNameMargins(
  options: AxisRecord,
  measure: AxisTextMeasure
): Margins {
  const margins: Margins = { left: 0, right: 0, top: 0, bottom: 0 }
  const add = (side: keyof Margins, value: number) => {
    margins[side] = Math.max(margins[side], value)
  }
  for (const orientation of ['x', 'y'] as const) {
    for (const axis of toAxisList(options[`${orientation}Axis`])) {
      const name = typeof axis.name === 'string' ? axis.name.trim() : ''
      if (!name || axis.show === false) continue
      const fontSize = fontSizeOf(axis.nameTextStyle)
      const gap = typeof axis.nameGap === 'number' ? axis.nameGap : 8
      const side = axisNameSide(orientation, axis.nameLocation)
      // 横向侧按文字宽度预算，纵向侧按行高预算；两者都要算上轴名与轴之间的 nameGap。
      const extent = side === 'left' || side === 'right'
        ? measure(name, fontSize) + gap
        : fontSize + gap
      add(side, extent)
    }
  }
  return margins
}

/**
 * 类目轴标签的宽度预算。
 *
 * 只对已经声明了截断（`overflow:'truncate'` + 固定 width）的轴生效：那是调用方
 * 明确要求"过长就截断"，预算只是把静态宽度收敛到当前容器装得下的范围。
 * 没有声明截断的轴不动——那属于调用方要求完整显示，不能替它改成截断。
 */
function fitCategoryLabels(
  options: AxisRecord,
  orientation: 'x' | 'y',
  available: number
) {
  const key = `${orientation}Axis`
  const axes = options[key]
  if (!axes) return undefined
  const list = toAxisList(axes)
  let changed = false
  const next = list.map(axis => {
    const label = axis.axisLabel
    if (axis.type !== 'category' || label?.overflow !== 'truncate' || !Number.isFinite(label?.width)) {
      return axis
    }
    const budget = Math.max(1, available * CATEGORY_LABEL_BUDGET_RATIO)
    const width = Math.min(label.width, budget)
    if (width === label.width) return axis
    changed = true
    return { ...axis, axisLabel: { ...label, width } }
  })
  if (!changed) return undefined
  return Array.isArray(axes) ? next : next[0]
}

export type ChartContainerSize = { width?: number; height?: number }

export function fitChartAxisLayout(
  options: AxisRecord,
  size: ChartContainerSize,
  measure: AxisTextMeasure = measureAxisText
) {
  if (!options || typeof options !== 'object') return options
  const width = size.width && size.width > 0 ? size.width : 0
  const height = size.height && size.height > 0 ? size.height : 0
  if (!width && !height) return options

  const grids = Array.isArray(options.grid)
    ? options.grid
    : [options.grid && typeof options.grid === 'object' ? options.grid : {}]
  const base = grids[0] ?? {}
  const nameMargins = collectAxisNameMargins(options, measure)

  const horizontalUsed = toPixels(base.left, width) + toPixels(base.right, width)
  const verticalUsed = toPixels(base.top, height) + toPixels(base.bottom, height)

  // 轴名留白只在绘图区还剩得下的前提下追加；宁可轴名紧一点，也不能让绘图区低于下限。
  const horizontalRoom = width ? Math.max(0, width - horizontalUsed - MIN_PLOT_SIZE) : 0
  const verticalRoom = height ? Math.max(0, height - verticalUsed - MIN_PLOT_SIZE) : 0
  const horizontalWanted = nameMargins.left + nameMargins.right
  const verticalWanted = nameMargins.top + nameMargins.bottom
  const horizontalScale = horizontalWanted > horizontalRoom && horizontalWanted > 0
    ? horizontalRoom / horizontalWanted
    : 1
  const verticalScale = verticalWanted > verticalRoom && verticalWanted > 0
    ? verticalRoom / verticalWanted
    : 1

  const nextGrid: AxisRecord = { ...base }
  let gridChanged = false
  const applyMargin = (side: keyof Margins, extra: number, extent: number) => {
    if (!extent || extra <= 0.5) return
    nextGrid[side] = toPixels(base[side], extent) + extra
    gridChanged = true
  }
  applyMargin('left', nameMargins.left * horizontalScale, width)
  applyMargin('right', nameMargins.right * horizontalScale, width)
  applyMargin('top', nameMargins.top * verticalScale, height)
  applyMargin('bottom', nameMargins.bottom * verticalScale, height)

  // 类目标签的可用空间要扣掉刚刚补出去的轴名留白，否则预算会偏大。
  const availableWidth = width
    ? Math.max(0, width - toPixels(nextGrid.left, width) - toPixels(nextGrid.right, width))
    : 0
  const availableHeight = height
    ? Math.max(0, height - toPixels(nextGrid.top, height) - toPixels(nextGrid.bottom, height))
    : 0
  const nextYAxis = availableWidth ? fitCategoryLabels(options, 'y', availableWidth) : undefined
  const nextXAxis = availableHeight ? fitCategoryLabels(options, 'x', availableHeight) : undefined

  if (!gridChanged && !nextYAxis && !nextXAxis) return options
  return {
    ...options,
    ...(gridChanged
      ? { grid: Array.isArray(options.grid) ? [nextGrid, ...grids.slice(1)] : nextGrid }
      : {}),
    ...(nextYAxis ? { yAxis: nextYAxis } : {}),
    ...(nextXAxis ? { xAxis: nextXAxis } : {})
  }
}
