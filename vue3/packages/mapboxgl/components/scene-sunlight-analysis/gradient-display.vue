<template>
  <div
    class="sm-component-scene-sunlight-analysis__gradient-bar"
    :style="barStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    stops: [string, number][]
    width?: string
    height?: string
    direction?: 'horizontal' | 'vertical'
    borderRadius?: number
  }>(),
  {
    width: '100%',
    height: '16px',
    direction: 'horizontal',
    borderRadius: 4
  }
)

const barStyle = computed(() => {
  const sortedStops = [...(props.stops || [])].sort((a, b) => a[1] - b[1])
  const colorStops = sortedStops
    .map(([color, pos]) => `${color} ${Math.round(pos * 100)}%`)
    .join(', ')
  const gradientDirection = props.direction === 'vertical' ? 'to bottom' : 'to right'

  return {
    width: props.width,
    height: props.height,
    borderRadius: `${props.borderRadius}px`,
    backgroundImage: colorStops ? `linear-gradient(${gradientDirection}, ${colorStops})` : 'none'
  }
})
</script>

