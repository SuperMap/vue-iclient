<template>
  <sm-progress-control
    ref="progressRef"
    :style="rootStyle"
    :percent="runtimePercent"
    :type="type"
    :status="status"
    :stroke-width="strokeWidth"
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
import type { ComponentPublicInstance } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SmProgressControl from './ProgressControl'
import { progressPropsDefault } from './types'
import { useThirdService, useTheme, useTimer } from '@supermapgis/common/hooks/index.common'

defineOptions({
  name: 'SmProgress'
})

const props = withDefaults(defineProps<ProgressProps>(), progressPropsDefault)

const { textColorStyle, containerBgStyle, colorPrimary } = useTheme(props)

const progressRef = ref<ComponentPublicInstance>()
const circleWidth = ref(0)
const finalValue = ref(props.percent)
const strokeColorData = ref(props.strokeColor || colorPrimary.value)

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

const rootStyle = computed(() => ({
  ...(props.background ? { background: props.background } : containerBgStyle.value),
  ...textColorStyle.value
}))

const progressSize = computed(() => {
  if (props.type !== 'circle') {
    return props.size
  }
  if (typeof props.size === 'number') {
    return props.size
  }
  return circleWidth.value || undefined
})

function measure() {
  const el = progressRef.value?.$el as HTMLElement | undefined
  if (!el) {
    return
  }
  circleWidth.value = Math.min(el.offsetWidth, el.offsetHeight)
}

watch(
  () => props.percent,
  val => {
    finalValue.value = val
  }
)

watch(
  () => props.strokeColor,
  val => {
    strokeColorData.value = val || colorPrimary.value
  }
)

watch(colorPrimary, val => {
  if (!props.strokeColor) {
    strokeColorData.value = val
  }
})

const { getData } = useThirdService(props, finalValue)
useTimer(props, { timing: getData })

onMounted(() => {
  measure()
  const el = progressRef.value?.$el as HTMLElement | undefined
  if (typeof ResizeObserver !== 'undefined' && el) {
    // 与 Vue2 一样测量进度条根元素，保留宿主直接设置尺寸时的自适应行为。
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>
