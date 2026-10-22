<template>
  <div class="sm-component-legend__themefield add-ellipsis" :style="secondaryTextColorStyle">
    {{ themFieldText }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getDerivedColorsByTextColor } from 'vue-iclient-core/utils/util'
import { useLocale, useTheme } from '@supermapgis/common/hooks/index.common'

const props = withDefaults(
  defineProps<{
    styleField?: string
    themeField?: string
  }>(),
  { themeField: '' }
)

const { t } = useLocale()
const { textColorStyle } = useTheme({})

// vue3 的 useTheme 未提供 secondaryTextColorStyle，按 vue2 的取色规则（文字色 45% 透明度）保持一致
const secondaryTextColorStyle = computed(() => ({
  color: getDerivedColorsByTextColor(textColorStyle.value.color as string, 0.45)
}))

const themFieldLabel = computed(() => {
  const themeFieldText = t('legend.themeField')
  if (!props.styleField) {
    return themeFieldText
  }
  const tips = {
    symbolsContent: t('legend.style'),
    color: t('legend.color'),
    size: t('legend.size'),
    opacity: t('legend.opacity'),
    width: t('legend.width'),
    outlineColor: t('legend.outlineColor'),
    outlineWidth: t('legend.outlineWidth'),
    outlineSymbolsContent: t('legend.outlineSymbolsContent'),
    outlineOpacity: t('legend.outlineOpacity'),
    textSize: t('legend.label') + '-' + t('legend.size'),
    textOpacity: t('legend.label') + '-' + t('legend.opacity'),
    textColor: t('legend.label') + '-' + t('legend.color'),
    textHaloColor: t('legend.label') + '-' + t('legend.haloColor')
  } as Record<string, string>
  return themeFieldText + t('legend.parentheses', { tips: tips[props.styleField] })
})

const themFieldText = computed(() => themFieldLabel.value + t('legend.colon') + props.themeField)
</script>
