import { computed, type Ref } from 'vue'
import {
  resolveLayoutDirection,
  shouldTransformArabicNumbers,
  toArabicNumber,
  toLatinNumber
} from '@supermapgis/common/utils/index.common'

export function useArabicDigits(enabled: Ref<boolean> | (() => boolean)) {
  const shouldUseArabicDigits = computed(() => {
    const isEnabled = typeof enabled === 'function' ? enabled() : enabled.value
    if (!isEnabled) {
      return false
    }
    return shouldTransformArabicNumbers(resolveLayoutDirection())
  })

  function normalizeValue(value: unknown): string {
    return toLatinNumber(String(value ?? ''))
  }

  function formatDisplayValue(value: unknown): string {
    const normalizedValue = normalizeValue(value)
    return shouldUseArabicDigits.value ? toArabicNumber(normalizedValue) : normalizedValue
  }

  return {
    shouldUseArabicDigits,
    normalizeValue,
    formatDisplayValue,
    toArabicNumber,
    toLatinNumber
  }
}
