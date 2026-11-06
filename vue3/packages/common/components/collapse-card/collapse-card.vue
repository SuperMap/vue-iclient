<template>
  <div
    ref="el"
    class="sm-component-collapse-card"
    :style="textColorStyle"
    v-bind="rootAttrs"
  >
    <div
      v-if="iconClass"
      :class="{
        ['sm-component-collapse-card__icon']: true,
        ['is-' + position]: true,
        [`is-click-${isShow ? 'out' : 'in'}`]: true,
        ['is-not-header']: !headerName,
        ['icon-box-shadow']: !isShow
      }"
      :style="[gisControlHeaderBgStyle, textColorHeadingStyle]"
      @click="iconClicked"
    >
      <i :style="iconStyle" :class="{ [iconClass]: true, ['is-auto-rotate']: autoRotate }" />
    </div>
    <transition
      name="sm-component-zoom-in"
      @after-leave="toggleTransition('leave')"
      @enter="toggleTransition('enter')"
    >
      <div
        v-show="isShow"
        :class="{
          ['sm-component-collapse-card__content']: true,
          ['is-not-header']: !headerName,
          ['is-' + position]: true,
          ['is-icon']: iconClass
        }"
        :style="getCardStyle"
      >
        <div
          v-if="headerName"
          :class="{
            'sm-component-collapse-card__header': true,
            'with-split-line': splitLine,
            ['is-' + position]: true
          }"
          :style="[gisControlHeaderBgStyle, textColorHeadingStyle, incomingTextStyle]"
        >
          <span class="sm-component-collapse-card__header-name">{{ headerName }}</span>
        </div>
        <div :style="getBodyStyle" class="sm-component-collapse-card__body">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { CollapseCardProps } from './types'
import { ref, computed, watch, onMounted, nextTick, useAttrs, useTemplateRef } from 'vue'
import { useTheme } from '@supermapgis/common/hooks/index.common'
import { splitControlStyle } from '@supermapgis/common/utils/theme/control-style'
import { collapaseCardPropsDefault } from './types'

defineOptions({
  name: 'SmCollapseCard',
  inheritAttrs: false
})

const TEXT_STYLE_KEYS = ['fontSize', 'fontFamily'] as const

const props = withDefaults(defineProps<CollapseCardProps>(), collapaseCardPropsDefault)
const attrs = useAttrs()

const controlStyle = computed(() => splitControlStyle(attrs.style))
const rootAttrs = computed(() => ({ ...attrs, style: controlStyle.value.rootStyle }))

const { textColorStyle, textColorHeadingStyle, gisControlHeaderBgStyle, gisControlBgStyle } =
  useTheme(props)

const isShow = ref(true)
const transform = ref(null)
const el = useTemplateRef('el')

function pickIncomingStyle(keys: readonly string[]) {
  const style = controlStyle.value.rootStyle
  const nextStyle: CSSProperties = {}
  for (const key of keys) {
    const value = (style as CSSProperties)[key as keyof CSSProperties]
    if (typeof value === 'string' && value) {
      nextStyle[key as keyof CSSProperties] = value as never
    }
  }
  return nextStyle
}

const incomingTextStyle = computed<CSSProperties>(() => {
  return pickIncomingStyle(TEXT_STYLE_KEYS)
})

const getCardStyle = computed(() => {
  const backgroundStyle = controlStyle.value.backgroundStyle
  const textStyle = incomingTextStyle.value
  if (!props.iconClass && !props.headerName) {
    return {
      background: 'transparent',
      ...backgroundStyle,
      ...textStyle
    }
  }
  return {
    ...gisControlBgStyle.value,
    ...backgroundStyle,
    ...textStyle
  }
})

const getBodyStyle = computed(() => ({
  background: 'transparent',
  ...incomingTextStyle.value
}))

const iconStyle = computed(() => {
  return {
    transform: transform.value
  }
})

const position = computed(() => props.iconPosition)

const rotateDeg = computed(() => {
  return {
    'top-right': ['rotate(135deg)', 'rotate(-45deg)'],
    'top-left': ['rotate(45deg)', 'rotate(-135deg)'],
    'bottom-left': ['rotate(-45deg)', 'rotate(135deg)'],
    'bottom-right': ['rotate(-135deg)', 'rotate(45deg)']
  }
})

const hasHeaderRotateDeg = computed(() => {
  return {
    'top-right': ['rotate(135deg)', 'rotate(-45deg)'],
    'top-left': ['rotate(45deg)', 'rotate(-135deg)'],
    'bottom-left': ['rotate(-45deg)', 'rotate(135deg)'],
    'bottom-right': ['rotate(-135deg)', 'rotate(45deg)']
  }
})

// watch 监听
watch(
  () => props.iconClass,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      isShow.value = !props.collapsed
      toggleTransition(props.collapsed ? 'leave' : 'enter')
    } else if (!newVal) {
      // 如果iconClass 为空 则默认显示内容
      isShow.value = true
    }
  }
)

watch(
  () => props.iconPosition,
  () => {
    resetIconTransform()
  }
)

if (props.iconClass) {
  isShow.value = !props.collapsed
}
resetIconTransform()

onMounted(() => {
  toggleTransition(props.collapsed ? 'leave' : 'enter')
})

function iconClicked() {
  isShow.value = !isShow.value
  resetIconTransform()
  emit('content-show-state', isShow.value)
}

function toggleTransition(type) {
  nextTick(() => {
    const iconDom = el.value.querySelector('.sm-component-collapse-card__icon')
    if (iconDom) {
      // @ts-ignore
      iconDom.style.position = type === 'leave' ? 'relative' : 'absolute'
    }
  })
}

function resetIconTransform() {
  let rotateDegObj = props.headerName ? hasHeaderRotateDeg.value : rotateDeg.value
  if (props.autoRotate) {
    transform.value = rotateDegObj[position.value][isShow.value ? 1 : 0]
  }
}

const emit = defineEmits(['content-show-state'])
</script>
