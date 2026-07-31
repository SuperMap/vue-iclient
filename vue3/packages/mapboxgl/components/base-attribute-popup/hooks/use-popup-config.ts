import type { PopupConfig } from '../types'
import type { CSSProperties, ComputedRef, Ref } from 'vue'
import { computed } from 'vue'

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
      return { width }
    }
    return { maxWidth, width }
  })
  const popupHeight = computed(() => {
    const { autoResize, maxHeight, height } = popupConfig.value
    if (!autoResize) {
      return { height }
    }
    return { maxHeight, height: height || contentHeight?.value }
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
