<template>
  <i v-if="'icon' in styleRendererData" :class="styleRendererData.icon" :style="cssStyle" />
  <div v-else-if="colors" :style="{ width: `${linearWidth}px`, padding: `0 ${maxPaletteOffset}px 0 ${minPaletteOffset}px` }">
    <div class="sm-component-legend__linearcolor" :style="linearColorStyle" />
    <div v-if="'styleField' in styleData" class="sm-component-legend__colorstop">
      <div
        v-for="(data, index) in mapPaletteToStops"
        :key="index"
        class="color-stop-holder"
        :style="{ [index === mapPaletteToStops.length - 1 ? 'right' : 'left']: `${data.offset}px` }"
      >
        <div class="color-arrow"></div>
        <div class="color-value" :style="{ backgroundColor: data.color }" />
      </div>
    </div>
    <div class="sm-component-legend__colorfieldrange">
      <div class="color-field-holder" :title="range.min" :style="{ left: `${minPaletteOffset}px` }">
        {{ range.min }}
      </div>
      <div class="color-field-holder" :title="range.max" :style="{ right: `${maxPaletteOffset}px` }">
        {{ range.max }}
      </div>
    </div>
  </div>
  <canvas v-else :id="canvasId" />
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import uniqueId from 'lodash.uniqueid'
import omit from 'omit.js'
import { formatFontSize, hexToRgba } from 'vue-iclient-core/utils/util'
import { useLocale } from '@supermapgis/common/hooks/index.common'
import type { LegendStyleGroupItem } from '../types'
import {
  createOutlineTileFromSprite,
  drawFillLegendOutline,
  getFillLegendPadding,
  getFillOutlineLayers
} from './fill-outline'
import { loadSpriteImage, loadSpriteMeta, getLoadedSpriteImage, getLoadedSpriteMeta } from './sprite'
import type { SpriteMeta } from './sprite'

const props = withDefaults(
  defineProps<{
    styleData?: LegendStyleGroupItem
    // 轮廓宽度是否被单独提取成数据驱动分组：其它分组符号按默认宽度 0.5 描边
    outlineWidthDriven?: boolean
  }>(),
  { styleData: () => ({}), outlineWidthDriven: false }
)

const { t } = useLocale()

const linearWidth = 214
let animateTimer: number | null = null
let isDestroyed = false

const canvasId = computed(() => {
  const { icon, colors, type } = styleRendererData.value
  if (icon || colors) {
    return null
  }
  return uniqueId(`legend_${type}_`)
})

const styleRendererData = computed(() => props.styleData.style || {})

const shapeType = computed(() => styleRendererData.value.shape?.toLowerCase())

const palette = computed(() => colorsToPalatte(styleRendererData.value.colors))

const range = computed(() => {
  if (!('styleField' in props.styleData)) {
    return {
      min: t('legend.bottom'),
      max: t('legend.top')
    }
  }
  const colors = styleRendererData.value.colors || []
  const lastIndex = colors.length ? colors.length - 1 : 0
  return {
    min: colors[0]?.key ?? t('legend.bottom'),
    max: colors[lastIndex]?.key ?? t('legend.top')
  }
})

const colors = computed(() => palette.value.map(p => p.color).join(','))

const mapPaletteToStops = computed(() => {
  const HALF_STOP_WIDTH = 5
  return palette.value.map((options, index) => {
    const { color, offset } = options
    const offsetVal = linearWidth * parseFloat(offset) - HALF_STOP_WIDTH
    return {
      color,
      offset: index === palette.value.length - 1 ? -HALF_STOP_WIDTH : offsetVal
    }
  })
})

const minPaletteOffset = computed(() => mapPaletteToStops.value[0]?.offset)

const maxPaletteOffset = computed(() => mapPaletteToStops.value.slice(-1)[0]?.offset)

const linearColorStyle = computed(() => {
  let linearColors = colors.value
  if (!('styleField' in props.styleData)) {
    linearColors = (styleRendererData.value.colors || []).reduce((style, item) => {
      style = style ? `${style}, ` : style
      style += `${item.value} ${item.key * 100}%`
      return style
    }, '')
  }
  return { backgroundImage: `linear-gradient(90deg, ${linearColors})` }
})

const cssStyle = computed(() => {
  if (shapeType.value === 'text') {
    return { fontSize: formatFontSize(styleRendererData.value.textSize) }
  }
  return omit(styleRendererData.value, ['type', 'shape', 'icon', 'colors'])
})

function colorsToPalatte(colorStops) {
  if (!colorStops) {
    return []
  }
  const { max, min } = range.value
  return colorStops.map(({ key, value }) => {
    return {
      color: value,
      offset: ((parseFloat(`${key}`) - min) / (max - min)).toFixed(2)
    }
  })
}

function drawShape() {
  const canvas = document.getElementById(canvasId.value) as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const { opacity = 1, fontSize, width, height } = styleRendererData.value
  if ('width' in styleRendererData.value) {
    canvas.width = parseInt(width)
    canvas.height = parseInt(height)
  } else {
    const size = parseInt(fontSize)
    canvas.width = size
    canvas.height = size
  }
  ctx.globalAlpha = opacity
  switch (shapeType.value) {
    case 'point': {
      const { color } = styleRendererData.value
      const radius = parseInt(fontSize) / 2
      ctx.arc(radius, radius, parseInt(fontSize) / 2, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
      break
    }
    case 'animatepoint': {
      animateTimer = initAnimatePoint() ?? null
      break
    }
    case 'radarpoint': {
      animateTimer = initRadar() ?? null
      break
    }
    case 'line':
    case 'animateline': {
      canvas.height = height && height < 1 ? 1 : height
      drawLines(canvas, ctx)
      break
    }
    case 'fill':
    case 'rectangle': {
      // 底色缺失时用图例色值兜底，避免画布保持空白（表现为「没有显示面的图例」）
      const { color, backgroundColor = color } = styleRendererData.value
      drawFillRect(canvas, backgroundColor || color)
      break
    }
    case 'triangle': {
      const { color } = styleRendererData.value

      // 计算边长，选择宽度和高度中较小的那个，并乘以2/sqrt(3)来得到边长
      // 因为等边三角形的高是边长的sqrt(3)/2，所以边长 = 高 * 2/sqrt(3)
      const sideLength = (Math.min(canvas.width, canvas.height) * 2) / Math.sqrt(3)

      // 计算三角形顶点和底边的位置
      const topX = canvas.width / 2 // 顶点位于顶部中央
      const topY = 0
      const gap = canvas.width * 0.09
      const bottomLeftX = topX - sideLength / 2 + gap // 左侧底角
      const bottomLeftY = canvas.height
      const bottomRightX = topX + sideLength / 2 - gap // 右侧底角
      const bottomRightY = canvas.height

      // 绘制等边三角形
      ctx.beginPath()
      ctx.moveTo(topX, topY)
      ctx.lineTo(bottomLeftX, bottomLeftY)
      ctx.lineTo(bottomRightX, bottomRightY)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
      break
    }
    case 'hexagon': {
      const { fontSize: hexFontSize, color } = styleRendererData.value
      const radius = parseInt(hexFontSize) / 2
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      ctx.beginPath()
      // 六边形的一个顶点与水平轴成30度角
      const startAngle = Math.PI / 6 // 30度转换为弧度
      // 绘制六边形的每个顶点
      for (let i = 0; i < 6; i++) {
        const angle = startAngle + (i * Math.PI) / 3 // 每次增加60度（弧度）

        // 计算每个顶点的x和y坐标
        const x = centerX + radius * Math.cos(angle)
        const y = centerY - radius * Math.sin(angle)

        // 将第一个点移动到路径的起始位置
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          // 后续的点用lineTo连接到路径上
          ctx.lineTo(x, y)
        }
      }
      // 描边六边形
      ctx.fillStyle = color
      ctx.fill()
      break
    }
  }
}

function drawLines(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  if (styleRendererData.value.lineStyles) {
    return drawMultiLine(canvas, ctx)
  }
  drawDashedLine(canvas, ctx)
}

// 面图例：填充底色 + 轮廓（纯色轮廓 / 轮廓线符号），支持 DPR 适配与轮廓不透明度
function drawFillRect(canvas: HTMLCanvasElement, backgroundColor?: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  const { opacity = 1, width, height, url } = styleRendererData.value
  const fillSize = parseInt(width) || parseInt(height)
  // 轮廓按真实线宽 1:1 绘制，画布在填充区外补半幅笔刷出血位，粗轮廓不被裁切，
  // 宽度分段主题各段宽度差异如实保留
  const padding = getFillLegendPadding(styleRendererData.value, props.outlineWidthDriven, fillSize)
  const size = fillSize + 2 * padding
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.round(size * dpr)
  canvas.height = Math.round(size * dpr)
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  // 先同步绘制底色与轮廓（无取图方式时图片轮廓层自动跳过，矢量轮廓立即可见）
  paintFillBase(ctx, fillSize, padding, backgroundColor, opacity)
  drawFillLegendOutline(canvas, size, padding, styleRendererData.value, {
    dpr,
    outlineWidthDriven: props.outlineWidthDriven
  })
  // 轮廓含图片符号（line-pattern 连续纹理 / icon-image 图标点）时，
  // 加载雪碧图后用轮廓图块整体重绘；优先使用库附带的 outlineSprites 元数据，未附带时请求 sprite.json
  const hasImageOutline = getFillOutlineLayers(styleRendererData.value.outlineSymbolsContent).some(
    layer => layer.kind === 'image'
  )
  if (!url || !hasImageOutline) {
    return
  }
  const attachedMeta = getAttachedSpriteMeta(styleRendererData.value.outlineSprites)
  // 雪碧图与元数据均已就绪（同一张雪碧图被多个图例项共用时很常见）就直接同步重绘，
  // 避免首帧只有底色、图片轮廓要等异步回调才补上
  const cachedImage = getLoadedSpriteImage(url)
  const cachedMeta = attachedMeta || getLoadedSpriteMeta(url)
  if (cachedImage && cachedMeta) {
    redrawFillOutline(canvas, fillSize, dpr, backgroundColor, opacity, cachedImage, cachedMeta)
    return
  }
  loadSpriteImage(url)
    .then(img => {
      if (isDestroyed) {
        return
      }
      const meta = attachedMeta || getLoadedSpriteMeta(url)
      if (meta) {
        redrawFillOutline(canvas, fillSize, dpr, backgroundColor, opacity, img, meta)
        return
      }
      loadSpriteMeta(url)
        .then(spriteMeta => {
          if (!isDestroyed) {
            redrawFillOutline(canvas, fillSize, dpr, backgroundColor, opacity, img, spriteMeta)
          }
        })
        .catch(() => {})
    })
    .catch(() => {})
}

// 样式里随库附带的雪碧图元数据（按图片 id 索引）
function getAttachedSpriteMeta(value: unknown): SpriteMeta | undefined {
  if (value && typeof value === 'object' && Object.keys(value as object).length) {
    return value as SpriteMeta
  }
  return undefined
}

// 填充中心填充区底色（填充区距画布边缘 padding）
function paintFillBase(
  ctx: CanvasRenderingContext2D,
  fillSize: number,
  padding: number,
  backgroundColor: string | undefined,
  opacity: number
) {
  // 没有有效底色时不绘制，避免 fillStyle 保持默认黑色
  if (!backgroundColor) {
    return
  }
  ctx.globalAlpha = opacity
  ctx.fillStyle = backgroundColor
  ctx.fillRect(padding, padding, fillSize, fillSize)
  ctx.globalAlpha = 1
}

// 雪碧图就绪后清空重绘：底色 + 全部轮廓层（含图片符号）
function redrawFillOutline(
  canvas: HTMLCanvasElement,
  fillSize: number,
  dpr: number,
  backgroundColor: string | undefined,
  opacity: number,
  spriteImage: HTMLImageElement,
  spriteMeta: SpriteMeta
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  const padding = getFillLegendPadding(styleRendererData.value, props.outlineWidthDriven, fillSize)
  const size = fillSize + 2 * padding
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, size, size)
  paintFillBase(ctx, fillSize, padding, backgroundColor, opacity)
  const createTile = (imageId: string, targetHeight?: number, pixelRatio?: number) =>
    createOutlineTileFromSprite(spriteImage, spriteMeta, imageId, targetHeight, pixelRatio)
  drawFillLegendOutline(canvas, size, padding, styleRendererData.value, {
    dpr,
    createTile,
    outlineWidthDriven: props.outlineWidthDriven
  })
}

function drawDashedLine(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const LEGEND_LINE_WIDTH = 100
  const LINE_DASH_WIDTH = 1
  const {
    lineDasharray: pattern = [],
    lineWidth = LINE_DASH_WIDTH,
    color = '#FFF',
    width = LEGEND_LINE_WIDTH,
    lineHeight
  } = styleRendererData.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.lineWidth = lineHeight || lineWidth
  ctx.strokeStyle = color

  ctx.beginPath()
  ctx.setLineDash(pattern.map(x => x * lineWidth))
  const y = 0 + ctx.lineWidth / 2
  ctx.moveTo(0, y)
  ctx.lineTo(width, y)
  ctx.stroke()
}

function drawMultiLine(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const { width: canvasWidth, lineStyles } = styleRendererData.value
  const newLines = roundNumber(lineStyles)

  const canvasHeight = getCanvasHeight(newLines)
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const startY = getStartY(newLines)
  newLines.forEach(v => {
    ctx.beginPath()
    const { lineWidth, color = '#FFF', lineDash } = v
    const y = getY(v, canvasHeight, startY)
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = color
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.setLineDash(lineDash)
    ctx.stroke()
  })
}

// 将所有宽度和offset取整；
function roundNumber(lineParams) {
  return lineParams.map(l => {
    const { lineWidth, lineOffset } = l
    let newOffset = lineOffset
    if (lineOffset > 0 && lineOffset < 1) {
      newOffset = 1
    } else if (lineOffset > -1 && lineOffset < 0) {
      newOffset = -1
    }
    return {
      ...l,
      lineWidth: lineWidth < 1 ? 1 : Math.round(lineWidth),
      lineOffset: Math.round(newOffset)
    }
  })
}

// 通过多线参数计算canvas的高度
function getCanvasHeight(lineParams) {
  const posWidths: number[] = []
  const negWidths: number[] = []
  lineParams.forEach(l => {
    const { lineWidth, lineOffset } = l
    if (lineOffset > 0) {
      posWidths.push(lineWidth + lineOffset)
    } else if (lineOffset < 0) {
      negWidths.push(lineWidth + Math.abs(lineOffset))
    }
  })
  const maxPosWidth = posWidths.length > 0 ? Math.max(...posWidths) : 0
  const maxNegWidth = negWidths.length > 0 ? Math.max(...negWidths) : 0
  let result = maxPosWidth + maxNegWidth
  lineParams.forEach(l => {
    const { lineWidth } = l
    if (lineWidth > result) {
      result += lineWidth - result
    }
  })
  // 中心0,0，所以需要+1
  return result + 1
}

// 计算开始的y
function getStartY(lineParams) {
  let minOffset = 0
  let minWidth = 0
  lineParams.forEach(l => {
    if (l.lineOffset && l.lineOffset < 0 && l.lineOffset < minOffset) {
      minOffset = l.lineOffset
      minWidth = l.lineWidth
    }
  })
  return Math.abs(minOffset) + minWidth
}

// 获取绘制的y轴位置
function getY(line, canvasHeight, startY) {
  const { lineWidth, lineOffset } = line
  const prefix = lineWidth / 2
  let y = 0
  if (lineOffset === 0) {
    // 中间对齐
    y = prefix + (canvasHeight - lineWidth) / 2
  } else if (lineOffset < 0) {
    // 负数
    y = prefix + (startY - (Math.abs(lineOffset) + lineWidth))
  } else {
    // + 1是0原点
    y = prefix + (canvasHeight - lineWidth) / 2 + lineOffset + 1
  }
  return y
}

function initAnimatePoint() {
  const { size, color, opacity, rings, speed } = styleRendererData.value
  const canvas = document.getElementById(canvasId.value) as HTMLCanvasElement
  if (!canvas) {
    return
  }
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const x = size / 2 // x 坐标值
  const y = size / 2 // y 坐标值
  const startAngle = 0 // 开始点
  const radius = size / 2
  const step = radius / rings

  const endAngle = Math.PI * 2 // 结束点

  function createCircle(newR, i) {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(x, y, newR, startAngle, endAngle)
    ctx.strokeStyle = color
    if (i === rings) {
      ctx.strokeStyle = hexToRgba(color, 0.1)
    }
    if (rings <= 3) {
      ctx.lineWidth = 1.5
    }
    ctx.stroke()
  }

  // 动画圆
  let i = 0
  const drawCircle = function () {
    const r = speed > 0 ? 0 + i * step : radius - i * step
    createCircle(r, i)
    if (i < rings) {
      i++
    } else {
      i = 0
    }
  }

  const render = function () {
    const prev = ctx.globalCompositeOperation
    // 只显示canvas上原图像的重叠部分
    ctx.globalCompositeOperation = 'destination-in'
    // 设置主canvas的绘制透明度
    ctx.globalAlpha = opacity
    // 这一步目的是将canvas上的图像变的透明
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // 在原图像上重叠新图像
    ctx.globalCompositeOperation = prev
    // 在主canvas上画新圆
    drawCircle()
  }
  const timer = setInterval(render, speed * 100)
  return timer
}

function initRadar() {
  const { size, color, opacity, speed } = styleRendererData.value
  const canvas = document.getElementById(canvasId.value) as HTMLCanvasElement
  if (!canvas) {
    return
  }
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  ctx.globalAlpha = opacity
  const x = size / 2 // x 坐标值
  const y = size / 2 // y 坐标值
  const radius = size / 2

  function drawRadar(iDeg) {
    if (!ctx) {
      return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const startAngle = ((-90 + (speed < 0 ? iDeg : -iDeg)) / 180) * Math.PI
    const endAngle = ((90 + (speed < 0 ? iDeg : -iDeg)) / 180) * Math.PI

    let grd = ctx.createLinearGradient(1.5 * radius, 2 * radius, 1.5 * radius, 0)
    if (iDeg >= 270) {
      grd = ctx.createLinearGradient(0, 1.5 * radius, 2 * radius, 1.5 * radius)
    } else if (iDeg >= 180) {
      grd = ctx.createLinearGradient(0.5 * radius, 0, 0.5 * radius, 2 * radius)
    } else if (iDeg >= 90) {
      grd = ctx.createLinearGradient(2 * radius, 0.5 * radius, 0, 0.5 * radius)
    }

    grd.addColorStop(0, hexToRgba(color, 0))
    grd.addColorStop(1, color)

    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.arc(x, y, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fill()
  }

  let deg = 0
  function loop() {
    deg = deg + 15
    drawRadar(deg)
    if (deg === 360) {
      deg = 0
    }
  }
  const timer = setInterval(loop, (2 * Math.PI * radius) / speed)
  return timer
}

onMounted(() => {
  if (canvasId.value) {
    drawShape()
  }
})

onBeforeUnmount(() => {
  isDestroyed = true
  if (animateTimer) {
    window.clearInterval(animateTimer)
  }
})
</script>
