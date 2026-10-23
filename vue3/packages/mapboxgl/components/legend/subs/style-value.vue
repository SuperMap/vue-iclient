<template>
  <!-- 图例项文本（可能是图层名或分段值）：宽度不足时单行省略，title 保留完整内容 -->
  <span class="sm-component-legend__fieldvalue add-ellipsis" :style="textStyle" :title="fieldLabel">
    {{ fieldLabel }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatFontSize } from 'vue-iclient-core/utils/util'
import { useLocale } from '@supermapgis/common/hooks/index.common'
import type { LegendStyleGroupItem } from '../types'

const props = withDefaults(
  defineProps<{
    styleData?: LegendStyleGroupItem
  }>(),
  { styleData: () => ({}) }
)

const { t } = useLocale()

const isTextShapeType = computed(() => props.styleData.style?.shape?.toLowerCase() === 'text')

function getTextShadow(textHaloWidth, textHaloBlur, textHaloColor) {
  const maxwidth = (textHaloBlur || 2) > (textHaloWidth || 2) ? textHaloBlur : textHaloWidth
  const width = maxwidth || 2
  textHaloColor = textHaloColor || '#242424'
  return `2px 1px ${width}px ${textHaloColor} , 0 0 ${width}px ${textHaloColor}, 0 0 ${width}px ${textHaloColor}`
}

const textStyle = computed(() => {
  if (!isTextShapeType.value) {
    return {}
  }
  const { textSize, textColor, textOpacity, textHaloColor, textHaloBlur, textHaloWidth, textFont } =
    props.styleData.style
  return {
    fontSize: formatFontSize(textSize),
    color: textColor,
    opacity: textOpacity,
    textShadow: getTextShadow(textHaloWidth, textHaloBlur, textHaloColor),
    fontFamily: textFont
  }
})

const rangeLabel = computed(() => {
  const { start, end, integerType } = props.styleData
  if (!start && !end) {
    return t('legend.outOfRange')
  }
  if (start && end) {
    if (integerType) {
      return getIntegerRangeInfo(start, end)
    }
    return `${start} - ${end}`
  }
  return start !== undefined ? `≥${start}` : `≤${end}`
})

const fieldLabel = computed(() => {
  if ('fieldValue' in props.styleData) {
    return props.styleData.fieldValue ?? t('legend.themeDefault')
  }
  return rangeLabel.value
})

function getIntegerRangeInfo(start, end) {
  if (end - 1 === start || end === start) {
    return `${start}`
  }
  return `${start} - ${end - 1}`
}
</script>
