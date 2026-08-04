import type { PopupConfig } from '../types'
import type { CSSProperties, ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

function parsePx(value?: string | number | null): number | null {
  if (value == null || value === '') {
    return null
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  const matched = String(value).trim().match(/^(-?\d+(?:\.\d+)?)px$/i)
  if (!matched) {
    return null
  }
  const num = Number(matched[1])
  return Number.isFinite(num) ? num : null
}

/** 合并弹窗配置限高与场景贴边限高，取更小值 */
export function mergePopupMaxHeight(
  configMaxHeight?: string | number | null,
  layoutMaxHeight?: string | number | null
): string | undefined {
  const values = [parsePx(configMaxHeight), parsePx(layoutMaxHeight)].filter(
    (item): item is number => item != null && item > 0
  )
  if (!values.length) {
    return undefined
  }
  return `${Math.min(...values)}px`
}

export function usePopupConfigHooks(
  popupConfig: ComputedRef<PopupConfig>,
  contentHeight?: Ref<string>
) {
  const popupStyle = computed(() => {
    const { autoResize, maxWidth, maxHeight, width, height, keyWordWrap, valueWordWrap, ...params } =
      popupConfig.value
    const style: CSSProperties = { ...params }
    return style
  })
  const popupWidth = computed(() => {
    const { autoResize, maxWidth, width } = popupConfig.value
    if (!autoResize) {
      return width ? { width } : {}
    }
    // autoResize：以 maxWidth（缺省 280px）作为面板宽度，避免「选择图层」等短内容把弹窗压得过窄
    const resolvedWidth = width || maxWidth || '280px'
    const style: CSSProperties = { width: resolvedWidth }
    if (maxWidth) {
      style.maxWidth = maxWidth
    }
    return style
  })
  const popupHeight = computed(() => {
    const { autoResize, maxHeight, height } = popupConfig.value
    if (!autoResize) {
      return height ? { height, maxHeight: height } : {}
    }
    // autoResize：只设最大高度，高度随内容，避免把 maxHeight 当成固定高度
    const style: CSSProperties = {}
    if (maxHeight) {
      style.maxHeight = maxHeight
    }
    return style
  })
  const ellipsisStyle: CSSProperties = {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
    maxWidth: '100%',
    wordBreak: 'keep-all'
  }
  const attributeStyle = computed(() => {
    const { keyWordWrap, valueWordWrap } = popupConfig.value
    const style: { keyStyle: CSSProperties; valueStyle: CSSProperties } = {
      keyStyle: {},
      valueStyle: {}
    }
    if (keyWordWrap === 'ellipsis') {
      style.keyStyle = { ...ellipsisStyle, height: '22px', lineHeight: '22px' }
    }
    if (valueWordWrap === 'ellipsis') {
      style.valueStyle = { ...ellipsisStyle, width: '100%' }
    }
    return style
  })
  return { popupWidth, popupHeight, popupStyle, attributeStyle }
}
