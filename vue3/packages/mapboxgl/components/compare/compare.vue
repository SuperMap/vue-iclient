<template>
  <div :id="target" class="sm-component-compare">
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
import CompareViewModel from 'vue-iclient-controllers-mapboxgl/src/CompareViewModel'
import { useTheme } from '@supermapgis/common/hooks/index.common'
import { debounce } from 'lodash-es'
import { addListener, removeListener } from 'resize-detector'
import { ComparePropsDefault } from './types'
import SmWebMap from '../web-map'
import type { CompareProps } from './types'
import type {
  mapType,
  compareOptions
} from 'vue-iclient-controllers-mapboxgl/src/CompareViewModel'

defineOptions({
  name: 'SmCompare'
})

interface SwipeStyle {
  backgroundColor?: string
  color?: string
  width?: string
  height?: string
  borderWidth?: string
  position?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  margin?: string
  boxSizing?: string
  borderRadius?: string
  transform?: string
  [key: string]: string | undefined
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
  const isHorizontal = props.orientation === 'horizontal'
  // 分隔条尺寸必须随方向切换：横向卷帘横向铺满、纵向卷帘纵向铺满。这里同时写成内联样式，
  // 避免样式表未加载或仍是旧产物里的固定 width:2px / height:100% 时，横向分隔条按竖向尺寸计算，
  // 而滑块又是相对分隔条做 left/top:50% 定位，结果滑块被算到容器左下角，看起来没有居中。
  const style: SwipeStyle = {
    backgroundColor: textColorStyle.value.color, // 这里需要根据实际情况处理 textColor
    position: 'absolute',
    top: '0',
    left: '0',
    width: isHorizontal ? '100%' : `${props.lineSize}px`,
    height: isHorizontal ? `${props.lineSize}px` : '100%',
    // 分隔条本身也要提示可拖动方向，避免样式表未生效时只显示默认光标
    cursor: isHorizontal ? 'ns-resize' : 'ew-resize'
  }
  return style
})

const compareSwipeSlideStyle = computed(() => ({
  backgroundColor: props.slideBackground,
  color: textColorStyle.value.color, // 这里需要根据实际情况处理 textColor
  width: `${props.slideSize}px`,
  height: `${props.slideSize}px`,
  borderWidth: `${props.lineSize}px`,
  position: 'absolute',
  top: '50%',
  left: '50%',
  // 主题里 RTL 会把 left 换成 right，这里把 right/bottom 归零，保证两个方向都按 left/top 定位
  right: 'auto',
  bottom: 'auto',
  // 插件自带样式里给竖向滑块留了负 margin（margin: -30px 1px 0），会额外顶偏圆心
  margin: '0',
  boxSizing: 'border-box',
  borderRadius: '50%',
  // 滑块悬停显示左右（纵向卷帘）/上下（横向卷帘）箭头，内联兜底不依赖样式表
  cursor: props.orientation === 'horizontal' ? 'ns-resize' : 'ew-resize',
  transform:
    props.orientation === 'horizontal'
      ? 'translate(-50%, -50%) rotate(90deg)'
      : 'translate(-50%, -50%)'
}))

// 定义方法
const diffStyle = (nextStyle: SwipeStyle, prevStyle: SwipeStyle): SwipeStyle => {
  const diff: SwipeStyle = {}
  for (const key in nextStyle) {
    if (nextStyle[key] !== prevStyle[key]) {
      diff[key] = nextStyle[key]
    }
  }
  return diff
}

// JS 驼峰样式名转 CSS 属性名，便于用 setProperty 指定 important
const hyphenateStyleName = (key: string) =>
  key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

const setSwipeStyle = (style: SwipeStyle = compareSwipeSlideStyle.value) => {
  const swipeDom = document.querySelector<HTMLElement>(`#${props.target} > .mapboxgl-compare > div`)
  if (swipeDom) {
    for (const key in style) {
      const value = style[key]
      if (value !== undefined) {
        swipeDom.style.setProperty(hyphenateStyleName(key), value)
      }
    }
  }
}

const setSwipeLineStyle = (style: SwipeStyle = compareSwipeLineStyle.value) => {
  const swipeLineDom = document.querySelector<HTMLElement>(`#${props.target} > .mapboxgl-compare`)
  if (swipeLineDom) {
    for (const key in style) {
      const value = style[key]
      // 只有宽高需要 important，其它属性（如插件写入的 transform）保持普通优先级，避免互相覆盖
      const priority = key === 'width' || key === 'height' ? 'important' : ''
      if (value !== undefined) {
        swipeLineDom.style.setProperty(hyphenateStyleName(key), value, priority)
      }
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
    setSwipeLineStyle(style)
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
