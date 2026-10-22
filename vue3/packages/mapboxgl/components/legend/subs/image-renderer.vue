<template>
  <canvas :id="canvasId"></canvas>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import omit from 'omit.js'
import uniqueId from 'lodash.uniqueid'
import type { LegendStyleGroupItem } from '../types'
import {
  createOutlineTileFromSprite,
  drawFillLegendOutline,
  getFillLegendPadding,
  getFillOutlineLayers
} from './fill-outline'
import { getLoadedSpriteMeta, loadSpriteImage, loadSpriteMeta } from './sprite'
import type { SpriteMeta } from './sprite'
import type { OutlineTile } from './fill-outline'

const props = withDefaults(
  defineProps<{
    styleData?: LegendStyleGroupItem
    // 轮廓宽度是否被单独提取成数据驱动分组：其它分组符号按默认宽度 0.5 描边
    outlineWidthDriven?: boolean
  }>(),
  { styleData: () => ({}), outlineWidthDriven: false }
)

const canvasId = uniqueId('legend_image_')

const styleRendererData = computed(() => props.styleData.style || {})

const shape = computed(() => styleRendererData.value.shape?.toLowerCase())

const cssStyle = computed(() =>
  omit(styleRendererData.value, ['type', 'shape', 'sprite', 'url', 'outlineSprites'])
)

// 面轮廓线符号是否含图片图案层（line-pattern / icon-image）
const hasImageOutline = computed(() => {
  if (shape.value !== 'rectangle') {
    return false
  }
  return getFillOutlineLayers(cssStyle.value.outlineSymbolsContent).some(layer => layer.kind === 'image')
})

let isDestroyed = false

onMounted(() => {
  // 雪碧图（sprite.png）加载完成后绘制；面轮廓含图片图案时优先用库随样式附带的雪碧图信息，
  // 未附带时请求同名 sprite.json 定位图案，元数据加载失败则退化为不绘制图案层
  loadSpriteImage(styleRendererData.value.url)
    .then(img => {
      if (isDestroyed) {
        return
      }
      if (!hasImageOutline.value) {
        return drawImage(img)
      }
      const { outlineSprites } = styleRendererData.value
      if (outlineSprites && Object.keys(outlineSprites).length) {
        return drawImage(img, outlineSprites)
      }
      const loadedMeta = getLoadedSpriteMeta(styleRendererData.value.url)
      if (loadedMeta) {
        return drawImage(img, loadedMeta)
      }
      return loadSpriteMeta(styleRendererData.value.url)
        .then(meta => {
          if (!isDestroyed) {
            drawImage(img, meta)
          }
        })
        .catch(() => {
          if (!isDestroyed) {
            drawImage(img)
          }
        })
    })
    .catch(() => {
      // 雪碧图不可用（url 缺失 / 图片加载失败）时仍需画出面图例的底色与轮廓，
      // 否则画布保持空白，表现为「没有显示面的图例」
      if (!isDestroyed) {
        drawRectFallback()
      }
    })
})

onBeforeUnmount(() => {
  isDestroyed = true
})

// 雪碧图不可用时的退化绘制：面图例只画底色与矢量轮廓，跳过图片图案层
function drawRectFallback() {
  if (shape.value !== 'rectangle') {
    return
  }
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) {
    return
  }
  const { width, height, backgroundColor, color, opacity } = cssStyle.value
  const fillSize = parseInt(width) || parseInt(height)
  if (!fillSize) {
    return
  }
  const padding = getFillLegendPadding(cssStyle.value, props.outlineWidthDriven, fillSize)
  const size = fillSize + 2 * padding
  canvas.width = Math.round(size)
  canvas.height = Math.round(size)
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  ctx.globalAlpha = opacity
  // 图片符号分支下 iClient 会把底色置为 transparent（颜色由雪碧图承载），
  // 雪碧图不可用时必须回退到色值，否则画布全空白，表现为「没有显示面的图例」
  ctx.fillStyle = resolveFillColor(backgroundColor, color)
  ctx.fillRect(padding, padding, fillSize, fillSize)
  ctx.globalAlpha = 1
  drawFillLegendOutline(canvas, size, padding, cssStyle.value, {
    dpr: 1,
    outlineWidthDriven: props.outlineWidthDriven
  })
}

// 底色优先级：有效底色 > 图例色值 > 透明
function resolveFillColor(backgroundColor?: string, color?: string) {
  if (backgroundColor && backgroundColor !== 'transparent') {
    return backgroundColor
  }
  return color || 'transparent'
}

function drawImage(img: HTMLImageElement, spriteMeta: SpriteMeta | null = null) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  if (!canvas) {
    return
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }
  const { opacity } = cssStyle.value
  const {
    sprite: {
      sdf,
      pixelRatio = 1,
      x: sx = 0,
      y: sy = 0,
      width: sWidth = img.width,
      height: sHeight = img.height
    } = {}
  } = styleRendererData.value
  let displayWidth = sWidth
  let displayHeight = sHeight
  let fillColor = 'transparent'
  let repeatPattern = false
  let displayIconWidth = 0
  let displayIconHeight = 0
  // 内容（底色 / 主图片）实际落位，默认铺满整个画布
  let contentX = 0
  let contentY = 0
  let contentWidth: number | undefined
  let contentHeight: number | undefined
  switch (shape.value) {
    case 'point': {
      const { fontSize, color } = cssStyle.value
      const size = parseInt(fontSize)
      displayWidth = size
      displayHeight = size
      // SDF 图片通过颜色底图和遮罩完成着色；普通图片保留自身颜色及透明背景。
      fillColor = sdf ? color : 'transparent'
      break
    }
    case 'animateline': {
      const { width, height, backgroundColor, iconStep } = cssStyle.value
      displayWidth = parseInt(width)
      displayHeight = parseInt(height)
      fillColor = backgroundColor
      repeatPattern = true
      displayIconWidth = iconStep
      displayIconHeight = displayHeight
      break
    }
    case 'rectangle': {
      const { width, height, backgroundColor } = cssStyle.value
      const fillSize = parseInt(width) || parseInt(height)
      // 轮廓按真实线宽 1:1 绘制，画布在填充区外补半幅笔刷出血位，底色与主图片落在中心填充区
      const padding = getFillLegendPadding(cssStyle.value, props.outlineWidthDriven, fillSize)
      contentX = padding
      contentY = padding
      contentWidth = fillSize
      contentHeight = fillSize
      displayWidth = fillSize + 2 * padding
      displayHeight = displayWidth
      fillColor = backgroundColor
      break
    }
  }
  contentWidth = contentWidth ?? displayWidth
  contentHeight = contentHeight ?? displayHeight
  canvas.width = displayWidth
  canvas.height = displayHeight
  // 与 StyleRenderer 保持一致：显式声明 CSS 尺寸，避免图例样式里的 canvas 宽高约束
  // 把画布拉伸/裁切，导致轮廓落在可视区之外
  canvas.style.width = `${displayWidth}px`
  canvas.style.height = `${displayHeight}px`
  ctx.globalAlpha = opacity
  ctx.fillStyle = fillColor
  ctx.fillRect(contentX, contentY, contentWidth, contentHeight)
  if (repeatPattern) {
    const patternCanvas = document.createElement('canvas')
    const patternContext = patternCanvas.getContext('2d') as CanvasRenderingContext2D
    patternCanvas.width = displayIconWidth
    patternCanvas.height = displayIconHeight
    patternContext.drawImage(
      img,
      sx * pixelRatio,
      sy * pixelRatio,
      sWidth,
      sHeight,
      0,
      0, // 目标矩形（绘制到Canvas的位置）
      displayIconWidth,
      displayIconHeight // 目标矩形（绘制的宽度和高度）
    )
    const pattern = ctx.createPattern(patternCanvas, 'repeat') as CanvasPattern
    ctx.fillStyle = pattern
    ctx.fillRect(0, 0, displayWidth, displayHeight)
  }
  if (sdf) {
    // set composite mode
    ctx.globalCompositeOperation = 'destination-in'
  }
  if (!repeatPattern) {
    // draw image
    ctx.drawImage(
      img,
      sx * pixelRatio,
      sy * pixelRatio,
      sWidth,
      sHeight,
      contentX,
      contentY,
      contentWidth,
      contentHeight
    )
  }
  // 面（图片填充符号）的轮廓层：纯色 / 轮廓线符号，该画布按物理像素 1:1 绘制，dpr 传 1
  if (shape.value === 'rectangle') {
    const padding = contentX
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    let createTile:
      | ((imageId: string, targetHeight?: number, dpr?: number) => OutlineTile | undefined)
      | undefined
    if (spriteMeta) {
      createTile = (imageId, targetHeight, dpr) =>
        createOutlineTileFromSprite(img, spriteMeta, imageId, targetHeight, dpr)
    }
    drawFillLegendOutline(canvas, displayWidth, padding, cssStyle.value, {
      dpr: 1,
      createTile,
      outlineWidthDriven: props.outlineWidthDriven
    })
  }
}
</script>
