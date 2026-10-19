<template>
  <canvas :id="canvasId"></canvas>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import omit from 'omit.js'
import uniqueId from 'lodash.uniqueid'
import type { LegendStyleGroupItem } from '../types'

const props = withDefaults(
  defineProps<{
    styleData?: LegendStyleGroupItem
  }>(),
  { styleData: () => ({}) }
)

const canvasId = uniqueId('legend_image_')

const styleRendererData = computed(() => props.styleData.style || {})

const shape = computed(() => styleRendererData.value.shape?.toLowerCase())

const cssStyle = computed(() => omit(styleRendererData.value, ['type', 'shape', 'sprite', 'url']))

function drawImage(img: HTMLImageElement) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const { opacity, outlineColor, outlineWidth = 0.5, outlineStyle = 'none' } = cssStyle.value
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
      displayWidth = parseInt(width)
      displayHeight = parseInt(height)
      fillColor = backgroundColor
      break
    }
  }
  canvas.width = displayWidth
  canvas.height = displayHeight
  ctx.globalAlpha = opacity
  ctx.fillStyle = fillColor
  ctx.fillRect(0, 0, displayWidth, displayHeight)
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
    ctx.drawImage(img, sx * pixelRatio, sy * pixelRatio, sWidth, sHeight, 0, 0, displayWidth, displayHeight)
  }
  if (outlineStyle === 'solid') {
    ctx.strokeStyle = outlineColor
    ctx.lineWidth = outlineWidth
    ctx.strokeRect(0, 0, displayWidth, displayHeight)
  }
}

onMounted(() => {
  const img = new Image()
  img.onload = () => {
    drawImage(img)
  }
  img.src = styleRendererData.value.url
})
</script>
