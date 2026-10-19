<template>
  <template v-for="(style, index) in layerStyles" :key="`style_${index}`">
    <StyleField v-if="shouldShowField(style)" :theme-field="style.themeField" :style-field="style.styleField" />
    <div class="sm-component-legend__wrap">
      <StyleItem v-for="(item, j) in style.styleGroup" :key="`style_${index}_${j}`" :style-data="item" />
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { LegendLayerStyle } from '../types'
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

// 基础图层（VECTOR）等没有专题字段的图层，仅开启 isShowField 时仍会渲染出空的“专题字段：”，
// 因此需要字段本身存在才展示
function shouldShowField(style: LegendLayerStyle) {
  return props.isShowField && Boolean(style?.themeField || style?.styleField)
}
</script>
