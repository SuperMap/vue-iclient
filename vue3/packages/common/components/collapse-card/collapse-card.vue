<template>
  <div class="sm-component-collapse-card" :style="[textColorStyle, incomingTextStyle]" ref="el">
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
import { collapaseCardPropsDefault } from './types'

const BACKGROUND_IMAGE_STYLE_KEYS = [
  'backgroundImage',
  'backgroundSize',
  'backgroundRepeat',
  'backgroundPosition'
] as const

const TEXT_STYLE_KEYS = ['fontSize', 'fontFamily'] as const

const props = withDefaults(defineProps<CollapseCardProps>(), collapaseCardPropsDefault)
const attrs = useAttrs()

const { textColorStyle, textColorHeadingStyle, gisControlHeaderBgStyle, gisControlBgStyle } =
  useTheme(props)

const isShow = ref(true)
const transform = ref(null)
const el = useTemplateRef('el')

function pickIncomingStyle(keys: readonly string[]) {
  const style = attrs.style
  if (!style || typeof style !== 'object' || Array.isArray(style)) {
    return {}
  }
  const nextStyle: CSSProperties = {}
  for (const key of keys) {
    const value = (style as CSSProperties)[key as keyof CSSProperties]
    if (typeof value === 'string' && value) {
      nextStyle[key as keyof CSSProperties] = value as never
    }
  }
  return nextStyle
}

const incomingBackgroundImageStyle = computed<CSSProperties>(() => {
  return pickIncomingStyle(BACKGROUND_IMAGE_STYLE_KEYS)
})

const incomingTextStyle = computed<CSSProperties>(() => {
  return pickIncomingStyle(TEXT_STYLE_KEYS)
})

const getCardStyle = computed(() => {
  const backgroundImageStyle = incomingBackgroundImageStyle.value
  const textStyle = incomingTextStyle.value
  if (!props.iconClass && !props.headerName) {
    return { background: 'transparent', ...backgroundImageStyle, ...textStyle }
  }
  return { ...gisControlBgStyle.value, ...backgroundImageStyle, ...textStyle }
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
    'top-right': ['rotate(-45deg)', 'rotate(135deg)'],
    'top-left': ['rotate(-135deg)', 'rotate(45deg)'],
    'bottom-left': ['rotate(135deg)', 'rotate(-45deg)'],
    'bottom-right': ['rotate(45deg)', 'rotate(-135deg)']
  }
})

const hasHeaderRotateDeg = computed(() => {
  return {
    'top-right': ['rotate(-45deg)', 'rotate(135deg)'],
    'top-left': ['rotate(-135deg)', 'rotate(45deg)'],
    'bottom-left': ['rotate(-135deg)', 'rotate(45deg)'],
    'bottom-right': ['rotate(-45deg)', 'rotate(135deg)']
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
