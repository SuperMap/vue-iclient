<script setup lang="ts">
import { computed } from 'vue'

interface CustomStatusConfig {
  title: string
  field: string
  color: string
}

const props = defineProps<{
  config: CustomStatusConfig
  feature: Record<string, any>
}>()

const value = computed(() => props.feature[props.config.field] ?? '')
</script>

<template>
  <div class="custom-popup-content">
    <span>{{ config.title }}</span>
    <strong :style="{ color: config.color }">{{ value }}</strong>
  </div>
</template>

<style scoped>
.custom-popup-content {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
</style>
