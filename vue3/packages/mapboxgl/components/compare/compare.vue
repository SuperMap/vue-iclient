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

let readinessRetries = 0
let readinessTimer: ReturnType<typeof setTimeout> | undefined
const MAX_READINESS_RETRIES = 3

const isMapReady = (map?: mapType): boolean => {
  if (!map) {
    return false
  }
  const isStyleLoaded = (map as mapType & { isStyleLoaded?: () => boolean }).isStyleLoaded
  return typeof isStyleLoaded === 'function' ? !!isStyleLoaded.call(map) : true
}

const rescheduleOptionsChange = () => {
  if (readinessTimer || readinessRetries >= MAX_READINESS_RETRIES) {
    return
  }
  readinessRetries += 1
  readinessTimer = setTimeout(() => {
    readinessTimer = undefined
    handleOptionsChange()
  }, 100)
}

/**
 * 需要把另一侧对齐到「刚刚加载完成的一侧」。
 * 两侧是按各自 mapOptions 独立创建的 Map；切换地图资源时 iClient 会销毁并重建 Map 实例，
 * 新地图按该资源自己的 mapOptions 生成视角。
 * 而 mapbox-gl-compare-enhanced 的 syncMaps 只在 move 时把视角推给另一侧，
 * 新建地图的初始视角不会触发 move，于是两侧各停在自己的视角上，看起来「没有同步」。
 * 这里在每侧加载完成、卷帘重建之后补一次对齐，后续的视角联动仍然完全交给插件。
 */
let alignSourceMap: mapType | undefined

/** 过渡视角（0 级 / [0,0]）不能当基准，否则会把另一侧也拉到 0 级。 */
const isViewUsable = (map: mapType) => {
  const zoom = map.getZoom()
  const center = map.getCenter()
  return zoom > 0.01 && !(center.lng === 0 && center.lat === 0)
}

const alignCompareView = () => {
  const source = alignSourceMap
  alignSourceMap = undefined
  if (!source || !beforeMapInstance || !afterMapInstance) {
    return
  }
  const target = source === beforeMapInstance ? afterMapInstance : beforeMapInstance
  if (!target || target === source || !isViewUsable(source)) {
    return
  }
  const center = source.getCenter()
  const zoom = source.getZoom()
  const currentCenter = target.getCenter()
  // 视角已经一致时不再跳转，避免多余 move/moveend 事件（会被外部回填成配置）
  if (
    target.getZoom() === zoom &&
    currentCenter.lng === center.lng &&
    currentCenter.lat === center.lat &&
    target.getBearing() === source.getBearing() &&
    target.getPitch() === source.getPitch()
  ) {
    return
  }
  target.jumpTo({
    center: [center.lng, center.lat],
    zoom,
    bearing: source.getBearing(),
    pitch: source.getPitch()
  })
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
    // 任一侧样式未就绪时先不插图，避免容器尺寸还是 0 时创建卷帘导致分隔条位置错乱；
    // 重试到上限后仍然继续，保证卷帘必定能显示
    if (!isMapReady(options.beforeMap) || !isMapReady(options.afterMap)) {
      if (readinessRetries < MAX_READINESS_RETRIES) {
        rescheduleOptionsChange()
        return
      }
    }
    // 卷帘两侧是两个相互独立的 Map，各自按传入的 mapOptions 创建并保持自己的视角；
    // 视角联动由 mapbox-gl-compare-enhanced 构造时的 syncMaps 完成（监听 move 后 jumpTo 另一侧），
    // 这里不再手动拷贝视角，否则会覆盖掉某一侧真正的 mapOptions。
    viewModel.init(options)
    // 卷帘重建完成后补一次视角对齐（新建地图的初始视角不会触发 move，插件同步不到）
    alignCompareView()
    initSwipeStyle()
    readinessRetries = 0
  }
}

const setBeforeMap = (params: { map: mapType }) => {
  const isRebuilt = !!beforeMapInstance && beforeMapInstance !== params.map
  if (isRebuilt) {
    // 地图实例重建时先摘掉旧实例上的卷帘，避免插件继续持有已销毁的地图
    viewModel.removed()
  }
  beforeMapInstance = params.map
  // 以刚加载完成的一侧作为对齐基准：首次挂载时后加载的一侧为准，
  // 切换地图资源时刚重建的一侧为准（新地图按该资源自己的 mapOptions 生成视角）。
  alignSourceMap = params.map
  handleOptionsChange()
}

const setAfterMap = (params: { map: mapType }) => {
  const isRebuilt = !!afterMapInstance && afterMapInstance !== params.map
  if (isRebuilt) {
    // 地图实例重建时先摘掉旧实例上的卷帘，避免插件继续持有已销毁的地图
    viewModel.removed()
  }
  afterMapInstance = params.map
  // 以刚加载完成的一侧作为对齐基准：首次挂载时后加载的一侧为准，
  // 切换地图资源时刚重建的一侧为准（新地图按该资源自己的 mapOptions 生成视角）。
  alignSourceMap = params.map
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
  if (readinessTimer) {
    clearTimeout(readinessTimer)
    readinessTimer = undefined
  }
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
