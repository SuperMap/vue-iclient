<template>
  <div class="sm-component-legend__item">
    <ImageRenderer
      v-if="styleType === 'image'"
      :style-data="styleData"
      :outline-width-driven="outlineWidthDriven"
    />
    <StyleRenderer v-else :style-data="styleData" :outline-width-driven="outlineWidthDriven" />
    <StyleValue v-if="showStyleField" :style-data="styleData" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { LegendStyleGroupItem } from '../types'
import ImageRenderer from './image-renderer.vue'
import StyleRenderer from './style-renderer.vue'
import StyleValue from './style-value.vue'

const props = withDefaults(
  defineProps<{
    styleData?: LegendStyleGroupItem
    // 轮廓宽度是否被单独提取成数据驱动分组
    outlineWidthDriven?: boolean
  }>(),
  { styleData: () => ({}), outlineWidthDriven: false }
)

const showStyleField = computed(() => {
  return 'fieldValue' in props.styleData || 'start' in props.styleData || 'end' in props.styleData
})

const styleType = computed(() => props.styleData.style?.type)
</script>
