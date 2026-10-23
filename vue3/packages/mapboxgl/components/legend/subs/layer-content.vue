<template>
  <template v-for="(style, index) in layerStyles" :key="`style_${index}`">
    <StyleField v-if="isShowField" :theme-field="style.themeField" :style-field="style.styleField" />
    <div class="sm-component-legend__wrap">
      <StyleItem
        v-for="(item, j) in style.styleGroup"
        :key="`style_${index}_${j}`"
        :style-data="item"
        :outline-width-driven="isOutlineWidthDriven"
      />
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { LegendLayerStyle } from '../types'
import { computed } from 'vue'
import StyleField from './style-field.vue'
import StyleItem from './style-item.vue'

const props = withDefaults(
  defineProps<{
    layerStyles?: LegendLayerStyle[]
    isShowField?: boolean
  }>(),
  {
    layerStyles: () => [],
    isShowField: false
  }
)

// 轮廓宽度被单独提取成分组（存在 styleField 为 outlineWidth 的部分）时：
// 宽度分段只在该分组按真实宽度展示，其它分组的轮廓符号统一按默认宽度绘制
const isOutlineWidthDriven = computed(() =>
  props.layerStyles.some(style => style.styleField === 'outlineWidth')
)
</script>
