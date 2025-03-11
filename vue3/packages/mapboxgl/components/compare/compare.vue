<template>
  <div class="sm-component-compare" :id="target">
    <template v-if="isRenderWebMap">
      <SmWebMap v-bind="beforeMapOptions" @load="setBeforeMap"></SmWebMap>
      <SmWebMap v-bind="afterMapOptions" @load="setAfterMap"></SmWebMap>
    </template>
    <template v-else-if="slots.beforeMap && slots.afterMap">
      <SlotRender />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { withCtx, useSlots, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import CompareViewModel from 'vue-iclient-core/controllers/mapboxgl/CompareViewModel'
import { useTheme } from '@supermapgis/common/components/theme/theme'
import { debounce } from 'lodash-es'
import { addListener, removeListener } from 'resize-detector'
import { ComparePropsDefault } from './types'
import SmWebMap from '../web-map'
import type { CompareProps } from './types'
import type {
  mapType,
  compareOptions
} from 'vue-iclient-core/controllers/mapboxgl/CompareViewModel'

interface SwipeStyle {
  backgroundColor?: string
  color?: string
  width?: string
  height?: string
  borderWidth?: string
}
const slots = useSlots()
// 定义 props
const props = withDefaults(defineProps<CompareProps>(), ComparePropsDefault)
const { textColorStyle } = useTheme(props)

const viewModel = new CompareViewModel()
let beforeMapInstance: mapType
let afterMapInstance: mapType
let resizeHandler

// 定义计算属性
const isRenderWebMap = computed(() => {
  return (
    Object.keys(props.beforeMapOptions).length > 0 && Object.keys(props.afterMapOptions).length > 0
  )
})
const additionalOptions = computed(() => ({
  orientation: props.orientation,
  mousemove: props.mousemove
}))

const compareSwipeLineStyle = computed(() => {
  const style: SwipeStyle = {
    backgroundColor: textColorStyle.value.color // 这里需要根据实际情况处理 textColor
  }
  let sizeFieldName = 'width'
  if (props.orientation === 'horizontal') {
    sizeFieldName = 'height'
  }
  style[sizeFieldName] = `${props.lineSize}px`
  return style
})

const compareSwipeSlideStyle = computed(() => ({
  backgroundColor: props.slideBackground,
  color: textColorStyle.value.color, // 这里需要根据实际情况处理 textColor
  width: `${props.slideSize}px`,
  height: `${props.slideSize}px`,
  borderWidth: `${props.lineSize}px`
}))

// 定义方法
const diffStyle = (nextStyle: SwipeStyle, prevStyle: SwipeStyle): SwipeStyle => {
  let diff: SwipeStyle = {}
  for (let key in nextStyle) {
    if (nextStyle[key] !== prevStyle[key]) {
      diff[key] = nextStyle[key]
    }
  }
  return diff
}

const setSwipeStyle = (style: SwipeStyle = compareSwipeSlideStyle.value) => {
  const swipeDom = document.querySelector<HTMLElement>(`#${props.target} > .mapboxgl-compare > div`)
  if (swipeDom) {
    for (let key in style) {
      const value = style[key]
      swipeDom.style[key] = value
    }
  }
}

const setSwipeLineStyle = (style: SwipeStyle = compareSwipeSlideStyle.value) => {
  const swipeLineDom = document.querySelector<HTMLElement>(`#${props.target} > .mapboxgl-compare`)
  if (swipeLineDom) {
    for (let key in style) {
      const value = style[key]
      swipeLineDom.style[key] = value
    }
  }
}

const initSwipeStyle = () => {
  setSwipeLineStyle()
  setSwipeStyle()
}

const resize = () => {
  handleOptionsChange()
}

const handleOptionsChange = () => {
  const options: compareOptions = {
    beforeMap: beforeMapInstance,
    afterMap: afterMapInstance,
    target: props.target,
    options: {
      orientation: props.orientation,
      mousemove: props.mousemove
    }
  }
  if (options.beforeMap && options.afterMap) {
    const beforeZoom = options.beforeMap.getZoom()
    const beforeCenter = options.beforeMap.getCenter()
    const beforeBearing = options.beforeMap.getBearing()
    const beforePitch = options.beforeMap.getPitch()
    if (beforeZoom !== options.afterMap.getZoom()) {
      options.afterMap.setZoom(beforeZoom)
    }
    if (beforeCenter.toString() !== options.afterMap.getCenter().toString()) {
      options.afterMap.setCenter(beforeCenter)
    }
    if (beforeBearing !== options.afterMap.getBearing()) {
      options.afterMap.setBearing(beforeBearing)
    }
    if (beforePitch !== options.afterMap.getPitch()) {
      options.afterMap.setPitch(beforePitch)
    }
    viewModel.init(options)
    initSwipeStyle()
  }
}

const setBeforeMap = (params: { map: mapType }) => {
  beforeMapInstance = params.map
  handleOptionsChange()
}

const setAfterMap = (params: { map: mapType }) => {
  afterMapInstance = params.map
  handleOptionsChange()
}

// 监听属性变化
watch(additionalOptions, () => {
  handleOptionsChange()
})

watch(compareSwipeLineStyle, (next, prev) => {
  const style = diffStyle(next, prev)
  if (style) {
    setSwipeLineStyle()
  }
})

watch(compareSwipeSlideStyle, (next, prev) => {
  const style = diffStyle(next, prev)
  if (style) {
    setSwipeStyle(style)
  }
})
// 生命周期钩子
onMounted(() => {
  if (props.autoresize) {
    resizeHandler = debounce(resize, 300, { leading: true })
    addListener(document.getElementById(props.target), resizeHandler)
  }
})

onBeforeUnmount(() => {
  viewModel.removed()
  if (props.autoresize) {
    removeListener(document.getElementById(props.target), resizeHandler)
  }
})

const SlotRender = () => [
  withCtx(() => {
    const beforeMapVNode = slots.beforeMap?.()
    if (beforeMapVNode && beforeMapVNode[0]) {
      beforeMapVNode[0].props = {
        ...beforeMapVNode[0].props,
        onLoad: setBeforeMap
      }
    }
    return beforeMapVNode
  })(),
  withCtx(() => {
    const afterMapVNode = slots.afterMap?.()
    if (afterMapVNode && afterMapVNode[0]) {
      afterMapVNode[0].props = {
        ...afterMapVNode[0].props,
        onLoad: setAfterMap
      }
    }
    return afterMapVNode
  })()
]
</script>
