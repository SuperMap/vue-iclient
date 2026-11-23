<template>
  <sm-progress-control
    ref="progressRef"
    :style="rootStyle"
    :percent="runtimePercent"
    :type="type"
    :status="status"
    :stroke-width="progressStrokeWidth"
    :stroke-color="strokeColorData"
    :trail-color="trailColor || undefined"
    :size="progressSize"
    :format="formatPercent"
    :show-info="showInfo"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </sm-progress-control>
</template>

<script lang="ts" setup>
import type { ProgressProps } from './types'
import type { ComponentPublicInstance, CSSProperties, StyleValue } from 'vue'
import { computed, normalizeStyle, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import SmProgressControl from './ProgressControl'
import { progressPropsDefault } from './types'
import { useThirdService, useTheme, useTimer } from '@supermapgis/common/hooks/index.common'

defineOptions({
  name: 'SmProgress'
})

const props = withDefaults(defineProps<ProgressProps>(), progressPropsDefault)
const attrs = useAttrs()

const { textColorStyle, containerBgStyle, colorPrimary } = useTheme(props)

const progressRef = ref<ComponentPublicInstance>()
const circleWidth = ref<number>()
const finalValue = ref(props.percent)
// 显式颜色仍优先；未配置时让 AntD 的成功、异常状态使用各自的状态色。
const strokeColorData = computed(() => {
  return props.strokeColor || (['success', 'exception'].includes(props.status) ? undefined : colorPrimary.value)
})

let resizeObserver: ResizeObserver | null = null

function strip(num: number, precision = 12) {
  return Number.isFinite(num) ? +parseFloat(num.toPrecision(precision)) : num
}

function getDecimalsFormatterVal(val: number, decimals?: number) {
  if (!Number.isFinite(+val)) {
    return val
  }
  return decimals === -1 || typeof decimals !== 'number' ? val : Number(val).toFixed(decimals)
}

const percentNumber = computed(() => {
  const value = strip(+finalValue.value)
  return Number.isFinite(value) ? value : 0
})

const runtimePercent = computed(() => {
  return strip(props.percentType === 'percentage' ? percentNumber.value * 100 : percentNumber.value)
})

const formatPercent = () => {
  return `${getDecimalsFormatterVal(runtimePercent.value, props.decimals)}%`
}

const rootStyle = computed(() => {
  const style = normalizeStyle([attrs.style as StyleValue]) as CSSProperties & Record<string, string | number | undefined>
  const fontSize = style?.fontSize ?? style?.['font-size']
  return {
    ...(props.background ? { background: props.background } : containerBgStyle.value),
    ...textColorStyle.value,
    // 仅在宿主指定字号时覆盖圆环的自动字号，未指定时保留 AntD 按直径计算的字号。
    '--sm-progress-font-size': typeof fontSize === 'number' ? `${fontSize}px` : fontSize
  }
})

const progressSize = computed(() => {
  if (props.type !== 'circle') {
    return props.size
  }
  if (typeof props.size === 'number') {
    return props.size
  }
  return circleWidth.value
})

const progressStrokeWidth = computed(() => {
  if (props.type !== 'circle') {
    return props.strokeWidth
  }
  // 无绘制空间时避免除以零；正常圆环的线宽为 0 时交给组件计算默认线宽。
  return progressSize.value === 0 ? 0 : props.strokeWidth || undefined
})

function measure(contentRect?: DOMRectReadOnly) {
  const el = progressRef.value?.$el as HTMLElement | undefined
  if (!el) {
    return
  }
  const style = getComputedStyle(el)
  // client 尺寸不含边框；首次测量再扣除内边距，后续优先使用观察器提供的内容尺寸。
  const width = contentRect?.width ?? (
    el.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0)
  )
  const height = contentRect?.height ?? (
    el.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0)
  )
  // 隐藏时没有布局盒，保留原尺寸供重新显示时使用。
  if (width <= 0 && height <= 0 && !el.getClientRects().length) {
    return
  }
  circleWidth.value = Math.max(0, Math.min(width, height))
}

watch(
  () => props.percent,
  val => {
    finalValue.value = val
  }
)

const { getData } = useThirdService(props, finalValue)
useTimer(props, { timing: getData })

onMounted(() => {
  measure()
  const el = progressRef.value?.$el as HTMLElement | undefined
  if (typeof ResizeObserver !== 'undefined' && el) {
    // 监听内容区域，容器尺寸或内边距变化时都重新计算圆环直径。
    resizeObserver = new ResizeObserver(([entry]) => {
      if (entry) {
        measure(entry.contentRect)
      }
    })
    resizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
