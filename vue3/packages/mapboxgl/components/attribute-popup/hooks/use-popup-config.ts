import type { PopupConfig } from '../types'
import type { CSSProperties, ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

export function usePopupConfigHooks(
  popupConfig: ComputedRef<PopupConfig>,
  contentHeight?: Ref<string>
) {
  const popupStyle = computed(() => {
    const { autoResize, maxWidth, maxHeight, width, height, keyWordWrap, valueWordWrap, ...params } = popupConfig.value
    const style: CSSProperties = {  ...params }
    if (!autoResize) {
      style.width = width
      style.height = height
    } else {
      style.maxWidth = maxWidth
      style.maxHeight = maxHeight
    }

    return style
  })
  const popupWidth = computed(() => {
    const { autoResize, maxWidth, width } = popupConfig.value
    if (!autoResize) {
      return { width }
    } else {
      return { maxWidth, width }
    }
  })
  const popupHeight = computed(() => {
    const { autoResize, maxHeight, height } = popupConfig.value
    if (!autoResize) {
      return { height }
    } else {
      return { maxHeight, height: height || contentHeight?.value }
    }
  })
  const ellipsisStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  }
  const attributeStyle = computed(() => {
    const { keyWordWrap, valueWordWrap } = popupConfig.value
    const style = { keyStyle: {}, valueStyle: {} }
    if (keyWordWrap === 'ellipsis') {
      style.keyStyle = { ...ellipsisStyle, height: '22px' }
    }
    if (valueWordWrap === 'ellipsis') {
      style.valueStyle = { ...ellipsisStyle }
    }
    return style
  })
  return { popupWidth, popupHeight, popupStyle, attributeStyle }
}
