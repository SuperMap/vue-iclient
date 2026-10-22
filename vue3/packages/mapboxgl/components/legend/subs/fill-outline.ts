/**
 * 面图层图例轮廓绘制工具。
 * 轮廓有两种来源，且与线图层符号绘制一致，区分图片符号与矢量符号：
 * 1) 轮廓线符号 outlineSymbolsContent：符号可能含多个线图层，每个图层可能是
 *    - 图片符号：line-pattern（连续纹理）/ icon-image（图标点），图标沿矩形各边方向旋转、重复铺设；
 *    - 矢量符号：line-width/line-color/line-dasharray，沿矩形描边；
 * 2) 纯色轮廓：outlineColor + outlineWidth，需要表达轮廓不透明度 outlineOpacity 时走 canvas 绘制。
 * 实现参考 MapStudio src/util/LegendUtil.ts 的 getFillOutlineLayers / drawFillOutline。
 */

import type { SpriteMeta } from './sprite'

const OUTLINE_WIDTH_KEY = 'line-width'
const OUTLINE_COLOR_KEY = 'line-color'
const OUTLINE_DASH_KEY = 'line-dasharray'
const OUTLINE_OPACITY_KEY = 'line-opacity'
const OUTLINE_OFFSET_KEY = 'line-offset'
const OUTLINE_PATTERN_KEY = 'line-pattern'
const ICON_IMAGE_KEY = 'icon-image'
const ICON_SPACING_KEY = 'symbol-spacing'
const LINE_JOIN_KEY = 'line-join'

// 未配置线宽的图标点（icon-image）按图片原始尺寸铺设，原始尺寸过大时按填充区边长
// 的该比例钳制成示意尺寸，保证图标点始终落在填充区边缘
const MAX_OUTLINE_ICON_RATIO = 0.2

// 轮廓宽度被单独提取成数据驱动分组时，其它分组（轮廓线符号/轮廓色/不透明度等）
// 未挂宽度值，统一使用的默认轮廓宽度，与面默认 outlineWidth '0.5px' 保持一致
export const DEFAULT_FILL_OUTLINE_WIDTH = 0.5

export interface OutlineImageLayer {
  kind: 'image'
  imageId: string
  lineWidth: number
  offset: number
  opacity: number
  spacing: number | null
}

export interface OutlineVectorLayer {
  kind: 'vector'
  lineWidth: number
  color: string
  dasharray: number[]
  offset: number
  opacity: number
  lineJoin: CanvasLineJoin
}

export type OutlineLayer = OutlineImageLayer | OutlineVectorLayer

/** 图片符号图块：物理像素 canvas + 元信息 */
export interface OutlineTile {
  /** 物理像素 canvas（drawImage 源） */
  canvas: HTMLCanvasElement
  /** 图块 CSS 宽（沿线方向） */
  cssWidth: number
  /** 图块 CSS 高（垂直线方向，即轮廓带宽度） */
  cssHeight: number
}

interface OutlineDrawable {
  layer: OutlineLayer
  tile?: OutlineTile
  bandWidth: number
  drawWidth?: number
  offset: number
}

interface FillOutlineOptions {
  dpr?: number
  /** 图块生成器 (imageId, targetHeight, dpr) => OutlineTile|undefined；不传时图片符号层自动跳过 */
  createTile?: (imageId: string, targetHeight?: number, dpr?: number) => OutlineTile | undefined
  /** 轮廓宽度是否被单独提取成数据驱动分组 */
  outlineWidthDriven?: boolean
}

/** 轮廓线符号中的单个线图层样式（paint/layout 为松散的样式键值） */
interface OutlineSymbolStyle {
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
}

/** 轮廓线符号 { symbolId, style }，style 可能为多图层数组 */
export interface OutlineSymbolContent {
  symbolId?: string
  style?: OutlineSymbolStyle | OutlineSymbolStyle[]
}

/** 图例样式数据中参与轮廓绘制的字段 */
export interface LegendOutlineStyleData {
  outlineSymbolsContent?: OutlineSymbolContent
  outlineOpacity?: number
  outlineStyle?: string
  outlineColor?: string
  outlineWidth?: string | number
}

export function clampOpacity(opacity: number): number {
  if (opacity < 0) return 0
  if (opacity > 1) return 1
  return opacity
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(item => typeof item === 'number')
}

// 面图例轮廓色 / 底色在 WebMapV3 中的默认值：数据未配置轮廓色时会被写成白色，
// 不能当作用户显式选中的轮廓色去覆盖轮廓线符号自身的颜色
const DEFAULT_OUTLINE_COLORS = ['#FFFFFF', '#FFF', 'WHITE', 'RGB(255,255,255)']

function isDefaultOutlineColor(color?: string): boolean {
  if (!color) {
    return true
  }
  return DEFAULT_OUTLINE_COLORS.includes(color.replace(/\s/g, '').toUpperCase())
}

/**
 * 将轮廓线符号归一化为可绘制图层（图片符号层 / 矢量符号层）
 * @param symbolState 轮廓线符号 { symbolId, style }
 * @param overrideColor 面板轮廓色，存在时覆盖各矢量子层的 line-color
 * @param overrideWidth 面板轮廓宽度，存在时覆盖各子层（含图片符号层）的 line-width
 * @returns 归一化后的轮廓图层
 */
export function getFillOutlineLayers(
  symbolState?: OutlineSymbolContent | null,
  overrideColor?: string,
  overrideWidth?: number
): OutlineLayer[] {
  const style = symbolState && symbolState.style
  if (!style) return []
  const symbolStyles = Array.isArray(style) ? style : [style]
  const layers: OutlineLayer[] = []
  symbolStyles.forEach(symbol => {
    const paint: Record<string, unknown> = symbol.paint || {}
    const layout: Record<string, unknown> = symbol.layout || {}
    const lineWidth = paint[OUTLINE_WIDTH_KEY]
    const offsetValue = paint[OUTLINE_OFFSET_KEY]
    const opacityValue = paint[OUTLINE_OPACITY_KEY]
    const offset = typeof offsetValue === 'number' ? offsetValue : 0
    const opacity = typeof opacityValue === 'number' ? opacityValue : 1
    // 面板轮廓宽度优先于符号自身残留的 line-width
    const resolvedWidth = overrideWidth ?? (typeof lineWidth === 'number' ? lineWidth : 1)
    const iconImage = layout[ICON_IMAGE_KEY]
    const linePattern = paint[OUTLINE_PATTERN_KEY]
    if (typeof iconImage === 'string') {
      layers.push({
        kind: 'image',
        imageId: iconImage,
        lineWidth: overrideWidth ?? (typeof lineWidth === 'number' ? lineWidth : 0),
        offset,
        opacity,
        // 图标点按间距铺设；未配置 symbol-spacing 时取图标自身宽度（连续）
        spacing: typeof layout[ICON_SPACING_KEY] === 'number' ? layout[ICON_SPACING_KEY] : null
      })
      return
    }
    if (typeof linePattern === 'string') {
      layers.push({
        kind: 'image',
        imageId: linePattern,
        lineWidth: resolvedWidth,
        offset,
        opacity,
        // 纹理连续铺设，不留间距
        spacing: null
      })
      return
    }
    const lineColor = paint[OUTLINE_COLOR_KEY]
    const lineDash = paint[OUTLINE_DASH_KEY]
    // 非线图层（仅含 fill-* 等其他 paint）忽略
    if (lineWidth === undefined && lineColor === undefined && overrideWidth === undefined) {
      return
    }
    const lineJoin = layout[LINE_JOIN_KEY]
    layers.push({
      kind: 'vector',
      lineWidth: resolvedWidth,
      // 与线图层图例一致：面板轮廓色优先于符号自身的 line-color
      color: overrideColor ?? (typeof lineColor === 'string' ? lineColor : '#FFFFFF'),
      dasharray: lineDash !== undefined && isNumberArray(lineDash) ? lineDash : [],
      offset,
      opacity,
      lineJoin: lineJoin === 'round' || lineJoin === 'bevel' ? lineJoin : 'miter'
    })
  })
  return layers
}

/** 构造纯色轮廓的单矢量图层 */
export function getPlainOutlineLayer(color: string, width: number): OutlineVectorLayer {
  return {
    kind: 'vector',
    lineWidth: width,
    color,
    dasharray: [],
    offset: 0,
    opacity: 1,
    lineJoin: 'miter'
  }
}

/**
 * 图例中轮廓层的实际绘制宽度（CSS px）：按符号真实线宽 1:1 取整，最小 1px。
 * 宽度分段主题各段宽度差异由此如实保留；粗线宽通过画布外扩 padding 容纳（见 getOutlinePadding）。
 */
export function getOutlineDrawWidth(rawWidth: number): number {
  return rawWidth < 1 ? 1 : Math.round(rawWidth)
}

/**
 * 未配置线宽的图标点（icon-image）在绘制时按填充区边长比例钳制的轮廓带宽度
 */
function getOutlineIconBandWidth(fillSize: number): number {
  return Math.max(1, Math.round(fillSize * MAX_OUTLINE_ICON_RATIO))
}

/**
 * 单层轮廓相对填充区边缘的出血量（CSS px）：半幅笔刷宽度减去 line-offset 外扩量
 */
function getLayerOutlineBleed(layer: OutlineLayer, fillSize?: number): number {
  // 图标点在绘制时会被钳制为填充区边长的固定比例，按同一比例预留出血位，避免图块比
  // 预留出血位宽时整层被跳过、轮廓完全看不到
  if (layer.kind === 'image' && layer.lineWidth <= 0 && fillSize && fillSize > 0) {
    return getOutlineIconBandWidth(fillSize) / 2 - roundOutlineOffset(layer.offset)
  }
  return getOutlineDrawWidth(layer.lineWidth) / 2 - roundOutlineOffset(layer.offset)
}

/**
 * 轮廓绘制在填充区外需要预留的出血位（CSS px）：取所有轮廓层半幅笔刷相对填充区边缘
 * 外扩量的最大值（line-offset 约定正值向内，会减小外扩；负值向外，增大外扩）。
 * 画布边长 = 填充区边长 + 2 × padding，粗轮廓按真实宽度绘制时也不会被裁切。
 * @param layers 归一化后的轮廓图层
 * @param fillSize 填充区边长（CSS px），用于估算图标点轮廓的出血位
 */
export function getOutlinePadding(layers: OutlineLayer[], fillSize?: number): number {
  if (!layers || !layers.length) {
    return 0
  }
  const bleeds = layers.map(layer => getLayerOutlineBleed(layer, fillSize))
  return Math.max(0, Math.round(Math.max(...bleeds)))
}

// line-offset 几何取整（与线图层 drawMultiLine 的 roundNumber 语义一致）
function roundOutlineOffset(offset: number): number {
  if (offset > 0 && offset < 1) {
    return 1
  }
  if (offset > -1 && offset < 0) {
    return -1
  }
  return Math.round(offset)
}

// canvas 对 0 长度虚线段跨浏览器行为不一致，归约为极小值；奇数长度补齐
function normalizeDash(pattern: number[]): number[] {
  if (!pattern.length) return []
  const dash = pattern.map(d => (d === 0 ? 0.01 : d))
  if (dash.length % 2 !== 0) {
    dash.push(0.01)
  }
  return dash
}

/**
 * 由雪碧图（与填充符号同源的 sprite.png）及 sprite.json 元数据生成轮廓图块
 * @param spriteImage 已加载的雪碧图
 * @param spriteMeta sprite.json 元数据（按图片 id 索引坐标）
 * @param imageId 图片 id（line-pattern / icon-image）
 * @param targetHeight 期望的几何高度（CSS px）；不传时用元数据中图片的实际尺寸
 * @param dpr 设备像素比
 */
export function createOutlineTileFromSprite(
  spriteImage: HTMLImageElement,
  spriteMeta: SpriteMeta | null | undefined,
  imageId: string,
  targetHeight?: number,
  dpr = 1
): OutlineTile | undefined {
  const entry = spriteMeta && spriteMeta[imageId]
  if (!spriteImage || !entry) return undefined
  const pixelRatio = entry.pixelRatio || 1
  // 元数据坐标为 CSS 尺寸，索引雪碧图物理像素时乘 pixelRatio（与 ImageRenderer 取填充区域一致）
  const sx = entry.x * pixelRatio
  const sy = entry.y * pixelRatio
  const sWidth = entry.width * pixelRatio
  const sHeight = entry.height * pixelRatio
  const tile = document.createElement('canvas')
  const ctx = tile.getContext('2d')
  if (!ctx) return undefined
  let cssHeight: number
  let cssWidth: number
  if (targetHeight && targetHeight > 0) {
    const ratio = targetHeight / entry.height
    cssHeight = targetHeight
    cssWidth = entry.width * ratio
    tile.width = Math.max(1, Math.round(cssWidth * dpr))
    tile.height = Math.max(1, Math.round(cssHeight * dpr))
  } else {
    cssWidth = entry.width
    cssHeight = entry.height
    tile.width = sWidth
    tile.height = sHeight
  }
  ctx.drawImage(spriteImage, sx, sy, sWidth, sHeight, 0, 0, tile.width, tile.height)
  return { canvas: tile, cssWidth, cssHeight }
}

// 矩形各边：起点（中心线角点）与沿线方向角（弧度，顺时针铺设，和地图线纹理沿线方向一致）
function getOutlineSides(size: number, inset: number) {
  const end = size - inset
  return [
    { x: inset, y: inset, angle: 0 }, // 上边：自左向右
    { x: end, y: inset, angle: Math.PI / 2 }, // 右边：自上向下
    { x: end, y: end, angle: Math.PI }, // 下边：自右向左
    { x: inset, y: end, angle: -Math.PI / 2 } // 左边：自下向上
  ]
}

/**
 * 图片符号：将图块沿矩形各边按方向旋转、重复铺设
 * @param ctx canvas 2d 上下文
 * @param size 图标 CSS 像素边长
 * @param inset 轮廓中心线距画布边缘的距离
 * @param bandWidth 轮廓带宽度（CSS px）
 * @param tile 图片图块
 * @param spacing 图块中心间距（CSS px），默认图块宽（连续）
 * @param drawWidth 图块沿线方向的绘制宽（CSS px），默认图块原始宽
 */
function strokeImageOutline(
  ctx: CanvasRenderingContext2D,
  size: number,
  inset: number,
  bandWidth: number,
  tile: OutlineTile,
  spacing: number | null,
  drawWidth = tile.cssWidth
) {
  const sideLength = size - 2 * inset
  if (sideLength <= 0 || !tile) {
    return
  }
  const step = spacing && spacing > 0 ? spacing : drawWidth
  // 每边可铺图块数；剩余量均分到起点，避免末尾出现短图块
  const count = Math.max(1, Math.floor(sideLength / step))
  const actualStep = sideLength / count
  const startShift = (sideLength - count * actualStep) / 2
  getOutlineSides(size, inset).forEach(side => {
    const dirX = Math.cos(side.angle)
    const dirY = Math.sin(side.angle)
    for (let i = 0; i < count; i++) {
      const distance = startShift + (i + 0.5) * actualStep
      const cx = side.x + dirX * distance
      const cy = side.y + dirY * distance
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(side.angle)
      ctx.drawImage(tile.canvas, -drawWidth / 2, -bandWidth / 2, drawWidth, bandWidth)
      ctx.restore()
    }
  })
}

/**
 * 在正方形 canvas 上沿线符号各图层描出矩形轮廓（调用方负责 DPR 与 transform）
 * @param canvas 画布
 * @param size 图标总边长（含外出血，CSS px）
 * @param padding 填充区距画布边缘的出血位
 * @param layers 归一化后的轮廓图层
 * @param tiles 已就绪的图片符号图块（按 imageId 索引 OutlineTile）
 * @param outlineOpacity 轮廓整体不透明度，与各图层自身 line-opacity 相乘
 * @param needClear 轮廓独立成画布时需要先清空；与填充共用一个画布时不能清空
 */
export function drawFillOutline(
  canvas: HTMLCanvasElement,
  size: number,
  padding: number,
  layers: OutlineLayer[],
  tiles: Map<string, OutlineTile>,
  outlineOpacity: number,
  needClear = true
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  if (needClear) {
    ctx.clearRect(0, 0, size, size)
  }
  const fillSize = size - 2 * padding

  const drawables: OutlineDrawable[] = []
  layers.forEach(layer => {
    if (layer.kind === 'image') {
      const tile = tiles.get(layer.imageId)
      if (!tile) {
        return
      }
      // 纹理按符号真实线宽取图块；图标点（lineWidth=0）保持图块原始尺寸，
      // 原始尺寸过大时按填充区比例钳制成示意尺寸，避免吞没整个填充区
      let bandWidth = layer.lineWidth > 0 ? getOutlineDrawWidth(layer.lineWidth) : tile.cssHeight
      let drawWidth = tile.cssWidth
      if (layer.lineWidth <= 0) {
        const maxBand = getOutlineIconBandWidth(fillSize)
        if (bandWidth > maxBand) {
          const scale = maxBand / bandWidth
          bandWidth = maxBand
          drawWidth = tile.cssWidth * scale
        }
      }
      drawables.push({
        layer,
        tile,
        bandWidth,
        drawWidth,
        offset: roundOutlineOffset(layer.offset)
      })
      return
    }
    drawables.push({
      layer,
      bandWidth: getOutlineDrawWidth(layer.lineWidth),
      offset: roundOutlineOffset(layer.offset)
    })
  })
  if (!drawables.length) {
    return
  }

  // line-offset 用矩形 inset 近似（约定正 offset 向内）；描边以填充区边缘为中心，
  // 包裹层已外补 padding 容纳外侧半幅笔刷，再按取整残差整体内移，保证轮廓完整落在画布内
  const minBound = Math.min(...drawables.map(d => padding + d.offset - d.bandWidth / 2))
  const shift = Math.max(0, -minBound)

  drawables.forEach(({ layer, tile, bandWidth, drawWidth, offset }) => {
    const inset = padding + offset + shift
    const remain = size - 2 * inset
    if (remain <= 0) {
      return
    }
    // 笔刷 / 图块比已预留的出血位更宽时按画布可容纳宽度收窄，而不是跳整层：
    // 跳整层会让轮廓（尤其是图片轮廓符号）在图例里完全看不到
    const drawBandWidth = Math.min(bandWidth, Math.max(1, inset * 2))
    ctx.globalAlpha = clampOpacity(layer.opacity * outlineOpacity)
    if (layer.kind === 'vector') {
      ctx.beginPath()
      ctx.rect(inset, inset, remain, remain)
      ctx.lineWidth = drawBandWidth
      ctx.strokeStyle = layer.color
      ctx.lineJoin = layer.lineJoin
      ctx.setLineDash(normalizeDash(layer.dasharray))
      ctx.stroke()
    } else if (tile) {
      // 图块按同一比例收窄，保持图案纵横比不失真
      const scale = drawBandWidth / bandWidth
      const tileWidth = (drawWidth ?? tile.cssWidth) * scale
      strokeImageOutline(ctx, size, inset, drawBandWidth, tile, layer.spacing, tileWidth)
    }
  })
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

/**
 * 由图例样式数据解析轮廓来源，归一化为可绘制图层
 * @param styleData 图例样式
 * @param outlineWidthDriven 轮廓宽度是否被单独提取成数据驱动分组。
 *   为 true 时：宽度分组自身分段项的 overrideWidth 为分段值（含缺省值），其它分组无宽度，
 *   符号各子层统一按默认轮廓宽度 DEFAULT_FILL_OUTLINE_WIDTH 绘制；
 *   为 false 时符号子层保持自身宽度（多层线符号各子层宽度不能被压平）
 */
export function resolveFillOutlineLayers(
  styleData?: LegendOutlineStyleData | null,
  outlineWidthDriven = false
): { layers: OutlineLayer[]; outlineOpacity: number } {
  const outlineSymbol = styleData && styleData.outlineSymbolsContent
  const outlineOpacity = clampOpacity(
    styleData && typeof styleData.outlineOpacity === 'number' ? styleData.outlineOpacity : 1
  )
  // 面板轮廓配置（颜色 / 宽度）：存在时优先于轮廓线符号内部的 line-color / line-width
  const overrideColor =
    styleData && typeof styleData.outlineColor === 'string' ? styleData.outlineColor : undefined
  let overrideWidth: number | undefined
  if (styleData && styleData.outlineWidth !== undefined && styleData.outlineWidth !== null) {
    const parsedWidth = Number.parseFloat(String(styleData.outlineWidth))
    overrideWidth = Number.isNaN(parsedWidth) ? undefined : parsedWidth
  }
  let layers: OutlineLayer[] = []
  if (outlineSymbol && outlineSymbol.symbolId) {
    // 面板轮廓色默认值 #FFFFFF（来自 WebMapV3 LEGEND_RENDER_TYPE.FILL 的默认值）
    // 并非图层的真实轮廓色：轮廓使用线符号时若拿它覆盖符号自身的 line-color，
    // 虚线、纹理等真实轮廓会全部变成一圈白边，因此默认白不作为覆盖色，
    // 只有用户显式改过轮廓色时才覆盖符号颜色
    const symbolOverrideColor = isDefaultOutlineColor(overrideColor) ? undefined : overrideColor
    // 与 MS LegendUtil 保持一致：固定场景下面板轮廓宽度（图例数据通常带默认值 '0.5px'，
    // 即使轮廓使用线符号也会存在）不能压过线符号各子层自身的 line-width，否则粗线符号
    // 会被压成 1px；只有轮廓宽度被单独提取成数据驱动分组时，宽度分组自身分段项挂的
    // 分段值才生效，其它分组未挂宽度时回退默认宽度
    let symbolOverrideWidth: number | undefined
    if (outlineWidthDriven) {
      symbolOverrideWidth = overrideWidth !== undefined ? overrideWidth : DEFAULT_FILL_OUTLINE_WIDTH
    }
    layers = getFillOutlineLayers(outlineSymbol, symbolOverrideColor, symbolOverrideWidth)
  } else if (styleData && styleData.outlineStyle === 'solid') {
    const defaultWidth = 0.5
    const parsedWidth = Number.parseFloat(String(styleData.outlineWidth ?? ''))
    layers = [
      getPlainOutlineLayer(
        styleData.outlineColor || '#FFFFFF',
        Number.isNaN(parsedWidth) ? defaultWidth : parsedWidth
      )
    ]
  }
  return { layers, outlineOpacity }
}

/**
 * 面图例轮廓在填充区外需要的出血位：调用方据此把画布尺寸由填充区边长外扩为
 * 边长 + 2 × padding，轮廓按真实线宽绘制也不会被裁切
 */
export function getFillLegendPadding(
  styleData?: LegendOutlineStyleData | null,
  outlineWidthDriven = false,
  fillSize?: number
): number {
  const { layers } = resolveFillOutlineLayers(styleData, outlineWidthDriven)
  return getOutlinePadding(layers, fillSize)
}

/**
 * 面图例轮廓绘制入口：根据图例样式数据选择轮廓来源并描边。
 * 调用方需已按 padding 外扩画布尺寸、将 ctx 按 dpr 设置好 transform，并在中心填充区填充完面底色。
 * @param canvas 画布
 * @param size 图标总边长（含外出血，CSS px）
 * @param padding 填充区距画布边缘的出血位
 * @param styleData 图例样式
 * @param options 绘制选项
 * @returns 缺少图片的图片 id 列表（图片符号无取图方式或图片尚未加载时）
 */
export function drawFillLegendOutline(
  canvas: HTMLCanvasElement,
  size: number,
  padding: number,
  styleData?: LegendOutlineStyleData | null,
  options: FillOutlineOptions = {}
): string[] {
  const { dpr = 1, createTile, outlineWidthDriven = false } = options
  const { layers, outlineOpacity } = resolveFillOutlineLayers(styleData, outlineWidthDriven)
  if (!layers.length) {
    return []
  }
  const tiles = new Map<string, OutlineTile>()
  const missingTiles: string[] = []
  layers.forEach(layer => {
    if (layer.kind !== 'image') {
      return
    }
    // 图标点（lineWidth=0）不指定目标高度，按原始尺寸取图块；纹理按符号真实线宽取图块
    const targetHeight = layer.lineWidth > 0 ? getOutlineDrawWidth(layer.lineWidth) : undefined
    const tile =
      typeof createTile === 'function' ? createTile(layer.imageId, targetHeight, dpr) : undefined
    if (tile) {
      tiles.set(layer.imageId, tile)
    } else {
      missingTiles.push(layer.imageId)
    }
  })
  // 与面填充共用同一画布，填充底色已由调用方画好，不能清空。
  // 图片符号取不到图块时该层跳过，不使用面板轮廓色兜底：面板轮廓色往往是默认的白色，
  // 兜底会在图例上画出一圈与真实轮廓无关的白边（与线图层图例行为不一致）
  drawFillOutline(canvas, size, padding, layers, tiles, outlineOpacity, false)
  return missingTiles
}
